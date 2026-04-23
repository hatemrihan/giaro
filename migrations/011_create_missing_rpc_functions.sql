-- ================================================================
-- Migration 011: Create missing RPC functions
-- claim_promo and toggle_all_products_visibility
-- ================================================================

-- Atomic promo claim: validates rules + increments used_count in one transaction
CREATE OR REPLACE FUNCTION claim_promo(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_promo
    FROM promos
    WHERE code = UPPER(TRIM(p_code))
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROMO_INVALID: Promo code not found';
    END IF;

    IF NOT v_promo.is_active THEN
        RAISE EXCEPTION 'PROMO_INACTIVE: Promo code is not active';
    END IF;

    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
        RAISE EXCEPTION 'PROMO_EXPIRED: Promo code has expired';
    END IF;

    IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_limit > 0 AND v_promo.used_count >= v_promo.usage_limit THEN
        RAISE EXCEPTION 'PROMO_EXHAUSTED: Promo code usage limit reached';
    END IF;

    IF v_promo.minimum_order IS NOT NULL AND p_subtotal < v_promo.minimum_order THEN
        RAISE EXCEPTION 'PROMO_MIN_ORDER: Minimum order amount not met (requires %%)', v_promo.minimum_order;
    END IF;

    UPDATE promos
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = v_promo.id;

    v_result := jsonb_build_object(
        'id', v_promo.id,
        'code', v_promo.code,
        'discount_type', v_promo.discount_type,
        'discount_value', v_promo.discount_value,
        'minimum_order', v_promo.minimum_order,
        'maximum_discount', v_promo.maximum_discount,
        'usage_limit', v_promo.usage_limit,
        'used_count', v_promo.used_count + 1,
        'is_active', v_promo.is_active,
        'expires_at', v_promo.expires_at,
        'description', v_promo.description,
        'created_at', v_promo.created_at,
        'updated_at', NOW()
    );

    RETURN v_result;
END;
$$;

-- Toggle all products visibility at once
CREATE OR REPLACE FUNCTION toggle_all_products_visibility(p_visible BOOLEAN)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE products
    SET is_active = p_visible,
        updated_at = NOW();
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;
