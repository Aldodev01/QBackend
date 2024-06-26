import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const locationController = {
    createLocation: async (req, res, next) => {
        const { name, latitude, longitude, range } = req.body;
        if(!name || !latitude || !longitude || !range) {
          res.status(400).json({ code: 400, error: 'All fields are required' });
          return next()
        }
      
        try {
          const location = await prisma.location.create({
            data: {
              name,
              latitude,
              longitude,
              range,
            },
          });
          if (location) {
            res.status(200).json({code: 200, data: location, message: `Successfully to create the location ${name}`});
            return next()
          } else {
            res.status(400).json({code: 400, data: location, message: `Somethings happened try again later`});
            return next()
          }
        } catch (error) {
          res.status(500).json({ error: error.message, message: `Failed to create location ${name}`, code: 500 });
          return next(error)
        }
      },
       getAllLocations: async (req, res) => {
        try {
          const locations = await prisma.location.findMany();
          res.json(locations);
          if(locations?.length > 0) {
            res.status(200).json({code: 200, data: locations, message: `Successfully to get all of location`});
            return next()
          } else if (locations?.length === 0) {
            res.status(200).json({code: 200, data: locations, message: `Successfully to get all of location but no one location to find`});
            return next()
          } else {
            res.status(400).json({code: 400, data: locations, message: `Somethings happened try again later`});
            return next()
          }
        } catch (error) {
          req.status(500).json({ error: error.message, message: `Failed to get all of location`});
          return next(error)
        }
      },
      
       updateLocation: async (req, res) => {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ error: 'Location ID is required' });
        }
        const { name, latitude, longitude, range } = req.body;
        if(!name || !latitude || !longitude || !range) {
          return res.status(400).json({ error: 'All fields are required' });
        }
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
          if (location) {
            res.status(200).json({code: 200, data: location, message: `Successfully to update the location ${name}`});
            return next()
          } else {
            res.status(400).json({code: 400, data: location, message: `Somethings happened try again later`});
            return next()
          }
        } catch (error) {
          res.status(500).json({ error: error.message, message: `Failed to update location ${name}`});
          return next(error)
        }
      },
      
       deleteLocation: async (req, res) => {
        const { id } = req.params;
        if (!id) {
          return res.status(404).json({ error: 'Location ID is required' });
        }
        try {
          await prisma.location.delete({
            where: { id },
          });
          res.status(200).json({code: 200, message: `Successfully to delete the location ${id}`});
        } catch (error) {
          res.status(500).json({ error: error.message, message: `Failed to delete location ${id}`});
          return next(error)
        }
      }
      
}


export default locationController;