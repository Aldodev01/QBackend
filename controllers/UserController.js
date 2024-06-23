import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import cloudinary from '../middlewares/CloudinaryConfig.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const userController = {
    createUser: async (req, res, next) => {
    const { username, email, password, phone, employee_no, profile_pic, status } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          phone,
          employee_no,
          profile_pic,
          status,
          join_date: new Date(),
          contract_end: new Date(new Date().setMonth(new Date().getMonth() + 6))
        }
      });
      if(user) {
        res.status(201).json({code: 201, data: user, message: `Successfully to create account ${username}`});
      } else {
        res.status(400).json({code: 400, data: user, message: `Somethings happened try again laterd`});
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to create account ${username}`});
      next(error)
    }
  },
  
 getAllUsers: async (req, res, next) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
      if(users?.length > 0) {
        res.status(200).json({code: 200, data: users, message: `Successfully to get all of account`});
      } else if (users?.length === 0) {
        res.status(200).json({code: 404, data: users, message: `Successfully to get all of account but no one account to find`});
      } else {
        res.status(400).json({code: 400, data: users, message: `Somethings happened try again laterd`});
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to get account`});
      next(error)
    }
  },
  
 getUserById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      } else {
        res.status(200).json({code: 200, data: user, message: `Successfully to get the account ${user.username}`});
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to get account ${id}`});
      next(error)
    }
  },
  
 updateUser: async (req, res, next) => {
    const { id } = req.params;
    const { username, email, phone, status } = req.body;
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { username, email, phone, status }
      });
      res.json(user);
      
      if(!username || !email || !phone || !status) {
        res.status(400).json({code: 400, data: user, message: `Please update the account all of the fields`});
      } else {
        if(user) {
          res.status(200).json({code: 200, user: user, message: `Successfully to update the account ${username}`});
        } else {
          res.status(404).json({code: 404, message: `User not Found`});
        }
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to Update User ${username}`});
      next(error)
    }
  },
  
 deleteUser: async (req, res, next) => {
    const { id } = req.params;
    try {
      await prisma.user.delete({ where: { id } });
      res.status(200).json({code: 200, message: `Successfully to delete the account ${id}`});
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to Delete User ${id}`});
      next(error)
    }
  },

  updateProfilePic: async (req, res, next) => {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    try {
      cloudinary.uploader.upload_stream({ folder: 'profile_pics' }, async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to upload image' });
        }
        const user = await prisma.user.update({
          where: { id },
          data: { profile_pic: result.secure_url }
        });
        res.status(200).json({code: 200, data: user, message: `Successfully to update the avatar account id : ${id}`});
      }).end(req.file.buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = await req.body;
      const user = await prisma.user.findUnique({
        where: { email },
      });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email' });
      } else if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      const token = jwt.sign(
        user,
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.json({ token, code: 200, user: user });
    } catch (error) {
      res.status(500).json({ error: error.message, code: 500});
      next(error)
    }
  },

  logout: (req, res, next) => {
    res.json({ message: 'Logout successful' });
  },
};

export default userController;
