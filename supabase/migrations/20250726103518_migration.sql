-- Update the user's role to admin so they can manage positions
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'b9076c65-a887-4ca1-99c4-bc02fbc48c67';