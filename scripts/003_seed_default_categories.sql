-- Function to seed default categories for new users
CREATE OR REPLACE FUNCTION public.seed_default_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Income categories
  INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (user_uuid, 'Salário', 'income', '#10b981', 'Briefcase'),
    (user_uuid, 'Freelance', 'income', '#3b82f6', 'Code'),
    (user_uuid, '13º Salário', 'income', '#8b5cf6', 'Gift'),
    (user_uuid, 'Investimentos', 'income', '#06b6d4', 'TrendingUp'),
    (user_uuid, 'Outras Receitas', 'income', '#6366f1', 'DollarSign');

  -- Expense categories
  INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (user_uuid, 'Supermercado', 'expense', '#ef4444', 'ShoppingCart'),
    (user_uuid, 'Cartão de crédito', 'expense', '#f97316', 'CreditCard'),
    (user_uuid, 'Plano de saúde', 'expense', '#84cc16', 'Heart'),
    (user_uuid, 'Prestação da casa', 'expense', '#14b8a6', 'Home'),
    (user_uuid, 'Presentes', 'expense', '#ec4899', 'Gift'),
    (user_uuid, 'Transporte', 'expense', '#8b5cf6', 'Car'),
    (user_uuid, 'Alimentação', 'expense', '#f59e0b', 'Utensils'),
    (user_uuid, 'Lazer', 'expense', '#06b6d4', 'Smile'),
    (user_uuid, 'Contas', 'expense', '#6366f1', 'FileText');
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default categories when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
