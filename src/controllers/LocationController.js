import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const locationController = {
    createLocation: async (req, res) => {
        const { name, latitude, longitude, range } = req.body;
      
        try {
          const location = await prisma.location.create({
            data: {
              name,
              latitude,
              longitude,
              range,
            },
          });
          res.json(location);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
       getAllLocations: async (req, res) => {
        try {
          const locations = await prisma.location.findMany();
          res.json(locations);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
      
       updateLocation: async (req, res) => {
        const { id } = req.params;
        const { name, latitude, longitude, range } = req.body;
      
        try {
          const location = await prisma.location.update({
            where: { id },
            data: {
              name,
              latitude,
              longitude,
              range,
            },
          });
          res.json(location);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
      
       deleteLocation: async (req, res) => {
        const { id } = req.params;
      
        try {
          await prisma.location.delete({
            where: { id },
          });
          res.json({ message: 'Location deleted successfully' });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
      
}


export default locationController;