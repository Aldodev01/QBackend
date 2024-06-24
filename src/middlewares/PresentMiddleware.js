export const checkWorkingHours = (req, res, next) => {
    const currentTime = new Date();
    const startHour = 20; // 9 AM
    const endHour = 10; // 5 PM
  
    if (currentTime.getHours() < startHour && currentTime.getHours() > endHour) {
      return res.status(400).json({ error: 'You are outside of working hours' });
    }
  
    next();
  };