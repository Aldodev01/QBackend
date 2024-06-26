import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PresentController = {
  async checkIn(req, res, next) {
    const { latitude, longitude, time, userId } = req.body;

    if (!latitude || !longitude || !time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID is required' });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const absences = await prisma.absence.findMany({
        where: {
          user: { id: userId },
          date: {
            gte: new Date(today),
            lt: new Date(today + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (absences.length > 0) {
        return res.status(200).json({ error: 'Already checked in today' });
      }

      const absence = await prisma.absence.create({
        data: {
          user: { connect: { id: userId } },
          date: new Date(),
          time_in: new Date(time),
          latitude: String(latitude),
          longitude: String(longitude),
          status: 'checked in',
        }
      });

      res.json(absence);
    } catch (error) {
      next(error);
    }
  },

  async checkOut(req, res, next) {
    const { latitude, longitude, time, userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID is required' });
    }

    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const absence = await prisma.absence.findFirst({
        where: {
          user: { id: userId },
          date: {
            gte: new Date(today),
            lt: new Date(today + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (!absence) {
        return res.status(400).json({ error: 'You have not checked in today' });
      }

      const updatedAbsence = await prisma.absence.update({
        where: { id: absence.id },
        data: {
          time_out: new Date(time),
          latitude: String(latitude),
          longitude: String(longitude),
          status: 'checked out'
        }
      });

      res.json(updatedAbsence);
    } catch (error) {
      next(error);
    }
  },

  async getUserAbsences(req, res, next) {
    const userId = req.body.userId;
    try {
        const absences = await prisma.absence.findMany({
            where: { user_id: userId },
            orderBy: { date: 'desc' },
            include: {
                user: true // Sertakan semua informasi dari model User
            }
        });

        // Format data untuk menggabungkan absensi dengan informasi pengguna
        const formattedAbsences = absences.map(absence => ({
            ...absence,
            user: {
                id: absence.user.id,
                username: absence.user.username,
                email: absence.user.email,
                phone: absence.user.phone,
                employee_no: absence.user.employee_no,
                profile_pic: absence.user.profile_pic,
                status: absence.user.status,
                join_date: absence.user.join_date,
                contract_end: absence.user.contract_end
            }
        }));

        res.json(formattedAbsences);
    } catch (error) {
        next(error);
    }
}

}

export default PresentController;
