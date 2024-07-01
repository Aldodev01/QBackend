import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PresentController = {
  async checkIn(req, res, next) {
    const { latitude, longitude, time, userId } = req.body;

  if (!latitude || !longitude || !time) {
    return res.status(400).json({ code: 400, error: 'All fields are required' });
  }

  if (!userId) {
    return res.status(404).json({ code: 404, error: 'Unauthorized: User ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ code: 404, error: 'User not found' });
    }

    const requestTime = new Date(time);
    const requestDate = requestTime.toISOString().split('T')[0]; // Get only the date part

    // Check if already checked in today
    const absences = await prisma.absence.findMany({
      where: {
        user_id: userId,
        time_in: {
          gte: new Date(`${requestDate}T00:00:00Z`),
          lt: new Date(`${requestDate}T23:59:59Z`)
        }
      }
    });

    if (absences.length > 0) {
      return res.status(400).json({ code: 400, error: 'Already checked in today' });
    }

    // Check if check-in is after the cut-off time
    const cutoffTime = new Date(`${requestDate}T12:00:00Z`);
    if (requestTime >= cutoffTime) {
      return res.status(400).json({ code: 400, error: 'Absences sudah ditutup' });
    }

    // Determine if late based on check-in time
    const lateTime = new Date(`${requestDate}T07:30:00Z`);
    const isLate = requestTime > lateTime;

    const absence = await prisma.absence.create({
      data: {
        user: { connect: { id: userId } },
        date: requestTime,
        time_in: requestTime,
        latitude: String(latitude),
        longitude: String(longitude),
        status: 'checked in',
        late: isLate,
      }
    });

    res.status(200).json({ code: 200, data: absence, message: 'Checked in successfully' });

  } catch (error) {
    res.status(500).json({ code: 500, error: error.message, message: 'Failed to check in' });
    next(error);
  }
  },

  async checkOut(req, res, next) {
    const { latitude, longitude, time, userId } = req.body;
  
    if (!userId) {
      return res.status(400).json({ error: 'Unauthorized: User ID is required' });
    }
  
    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const absence = await prisma.absence.findFirst({
        where: {
          user_id: userId,
          date: {
            gte: new Date(today),
            lt: new Date(today + 24 * 60 * 60 * 1000)
          }
        }
      });
  
      if (!absence) {
        return res.status(400).json({ error: 'You have not checked in today' });
      }
  
      let checkOutTime = new Date(time);
      const endOfDay = new Date(today).setHours(21, 30, 0, 0); // 21:30 of the same day
  
      if (checkOutTime > endOfDay) {
        checkOutTime = new Date(endOfDay);
      }
  
      const updatedAbsence = await prisma.absence.update({
        where: { id: absence.id },
        data: {
          time_out: checkOutTime,
          latitude: String(latitude),
          longitude: String(longitude),
          status: 'checked out',
        }
      });
  
      res.status(200).json({ code: 200, data: updatedAbsence, message: 'Checked out successfully' });
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: 'Failed to check out' });
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
  },
  async getUserAbsencesId(req, res, next) {
    const { id } = req.params;

    try {
      const absences = await prisma.absence.findMany({
          where: { user_id: id },
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
      return res.status(200).json({ code: 200, data:formattedAbsences,  message: 'user not found' });
  } catch (error) {
      next(error);
  }
  },
  async getSummaries(req, res, next) {
    try {
      const { id } = req.params;
      const { status, late } = req.body;
  
      let whereClause = {};
  
      // If user ID is provided in the URL params
      if (id) {
        whereClause.user_id = id;
      }
  
      // If status is provided in the request body
      if (status) {
        whereClause.status = status;
      }
  
      // If late is provided in the request body
      if (typeof late === 'boolean') {
        whereClause.late = late;
      }
  
      // Count absences based on the constructed where clause
      const count = await prisma.absence.count({
        where: whereClause
      });
  
      // Adjust response based on conditions
      if (id && count === 0) {
        return res.status(404).json({ code: 404, message: 'user not found' });
      } else if (count === 0) {
        return res.status(200).json({ code: 200, count, message: 'data kosong' });
      } else {
        return res.status(200).json({ code: 200, count, message: 'berhasil mendapatkan data' });
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: 'Failed to get summaries' });
      next(error);
    }
  },
  async getSummariesUserAll(req, res, next) {
    const { id } = req.params;
  
    try {
      // Menghitung jumlah late true
      const lateTrueCount = await prisma.absence.count({
        where: {
          user_id: id,
          late: true
        }
      }) ?? 0;
  
      // Menghitung jumlah late false
      const lateFalseCount = await prisma.absence.count({
        where: {
          user_id: id,
          late: false
        }
      }) ?? 0;
  
      // Menghitung total jumlah absensi
      const totalAbsences = await prisma.absence.count({
        where: {
          user_id: id
        }
      }) ?? 0;

      res.status(200).json({ code: 200, data: { lateTrueCount ,lateFalseCount,totalAbsences}, message: 'Successfully to get summaries' });     
    } catch (error) {
      // Menghandle error jika terjadi masalah dalam pengambilan data
      res.status(500).json({
        error: 'Failed to fetch summaries',
        message: error.message
      });
      next(error);
    }
  },

}

export default PresentController;
