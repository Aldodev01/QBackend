export const checkWorkingHours = (req, res, next) => {
  const currentTime = new Date();
  const startHour = 6;  // 6 AM
  const endHour = 21;   // 9 PM

  const currentHour = currentTime.getHours();
  if (currentHour < startHour || currentHour >= endHour) {
    return res.status(400).json({ error: 'You are outside of working hours' });
  }

  next();
};