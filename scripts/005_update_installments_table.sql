-- Add type column to installments table to support both income and expense installments
ALTER TABLE public.installments 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense'));

-- Update the generate_installment_transactions function to use the installment type
CREATE OR REPLACE FUNCTION generate_installment_transactions(installment_uuid UUID)
RETURNS void AS $$
DECLARE
  installment_record RECORD;
  current_date DATE;
  installment_number INTEGER;
BEGIN
  -- Get installment details
  SELECT * INTO installment_record
  FROM installments
  WHERE id = installment_uuid;

  -- Generate transactions for each installment
  FOR installment_number IN 1..installment_record.total_installments LOOP
    -- Calculate date based on frequency
    CASE installment_record.frequency
      WHEN 'daily' THEN
        current_date := installment_record.start_date + (installment_number - 1);
      WHEN 'weekly' THEN
        current_date := installment_record.start_date + ((installment_number - 1) * 7);
      WHEN 'monthly' THEN
        current_date := installment_record.start_date + ((installment_number - 1) * INTERVAL '1 month');
      WHEN 'yearly' THEN
        current_date := installment_record.start_date + ((installment_number - 1) * INTERVAL '1 year');
    END CASE;

    -- Create transaction with the installment type
    INSERT INTO transactions (
      user_id,
      account_id,
      category_id,
      description,
      amount,
      type,
      date,
      installment_id
    ) VALUES (
      installment_record.user_id,
      installment_record.account_id,
      installment_record.category_id,
      installment_record.description || ' (' || installment_number || '/' || installment_record.total_installments || ')',
      installment_record.installment_amount,
      installment_record.type,
      current_date,
      installment_uuid
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance(account_uuid UUID, amount_change DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE accounts
  SET balance = balance + amount_change,
      updated_at = NOW()
  WHERE id = account_uuid;
END;
$$ LANGUAGE plpgsql;
