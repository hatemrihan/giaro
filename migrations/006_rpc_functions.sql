-- Migration 006: Add RPC function for bulk updates

CREATE OR REPLACE FUNCTION toggle_all_products_visibility(p_visible BOOLEAN)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  UPDATE products SET is_active = p_visible;
  GET DIAGNOSTICS result = ROW_COUNT;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
