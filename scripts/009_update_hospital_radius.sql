-- Update all hospitals to have 50km alert radius
UPDATE hospitals SET radius = 50 WHERE radius IS NOT NULL;
