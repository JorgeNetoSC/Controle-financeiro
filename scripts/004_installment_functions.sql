-- Function to generate installment transactions
CREATE OR REPLACE FUNCTION public.generate_installment_transactions(installment_uuid UUID)
RETURNS VOID AS $$
DECLARE
  inst_record RECORD;
  current_date DATE;
  i INTEGER;
BEGIN
  -- Get installment details
  SELECT * INTO inst_record FROM public.installments WHERE id = installment_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Installment not found';
  END IF;

  -- Generate transactions for each installment
  current_date := inst_record.start_date;
  
  FOR i IN 1..inst_record.total_installments LOOP
    INSERT INTO public.transactions (
      user_id,
      account_id,
      category_id,
      description,
      amount,
      type,
      date,
      installment_id,
      notes
    ) VALUES (
      inst_record.user_id,
      inst_record.account_id,
      inst_record.category_id,
      inst_record.description || ' (' || i || '/' || inst_record.total_installments || ')',
      inst_record.installment_amount,
      'expense',
      current_date,
      installment_uuid,
      'Parcela ' || i || ' de ' || inst_record.total_installments
    );
    
    -- Calculate next date based on frequency
    IF inst_record.frequency = 'monthly' THEN
      current_date := current_date + INTERVAL '1 month';
    ELSIF inst_record.frequency = 'weekly' THEN
      current_date := current_date + INTERVAL '1 week';
    ELSIF inst_record.frequency = 'yearly' THEN
      current_date := current_date + INTERVAL '1 year';
    ELSE
      current_date := current_date + INTERVAL '1 day';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balance
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.type = 'income' THEN
      UPDATE public.accounts 
      SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.accounts 
      SET balance = balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.account_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Revert old transaction
    IF OLD.type = 'income' THEN
      UPDATE public.accounts 
      SET balance = balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.accounts 
      SET balance = balance + OLD.amount, updated_at = NOW()
      WHERE id = OLD.account_id;
    END IF;
    
    -- Apply new transaction
    IF NEW.type = 'income' THEN
      UPDATE public.accounts 
      SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.accounts 
      SET balance = balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.account_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.type = 'income' THEN
      UPDATE public.accounts 
      SET balance = balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.accounts 
      SET balance = balance + OLD.amount, updated_at = NOW()
      WHERE id = OLD.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update account balance on transaction changes
DROP TRIGGER IF EXISTS transaction_balance_update ON public.transactions;

CREATE TRIGGER transaction_balance_update
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance();
