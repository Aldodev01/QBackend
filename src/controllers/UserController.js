import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import cloudinary from '../middlewares/CloudinaryConfig.js';
dotenv.config();
const userController = {
    createUser: async (req, res, next) => {
    const { username, email, password, phone, employee_no, profile_pic, status } = req.body;
    if(!username || !email || !password || !phone || !employee_no || !profile_pic || !status) {
      res.status(400).json({code: 400, message: `Please update the account all of the fields`});
      return next()
    }
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
        return next()
      } else {
        res.status(400).json({code: 400, data: user, message: `Somethings happened try again laterd`});
        return next()
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to create account ${username}`});
      return next(error)
    }
  },
  
 getAllUsers: async (_, res, next) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
      if(users?.length > 0) {
        res.status(200).json({code: 200, data: users, message: `Successfully to get all of account`});
        return next()
      } else if (users?.length === 0) {
        res.status(200).json({code: 404, data: users, message: `Successfully to get all of account but no one account to find`});
        return next()
      } else {
        res.status(400).json({code: 400, data: users, message: `Somethings happened try again later`});
        return next()
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to get account`});
      return next(error)
    }
  },
  
 getUserById: async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      res.status(404).json({code: 404, message: `Please Input the account id`});
      return next()
    }
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return next()
      } else if (user) {
        res.status(200).json({code: 200, data: user, message: `Successfully to get the account ${user.username}`});
        return next()
      } else {
        res.status(400).json({code: 400, data: user, message: `Somethings happened try again later`});
        return next()
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to get account ${id}`});
      return next(error)
    }
  },
  
 updateUser: async (req, res, next) => {
    const { id } = req.params;
    const { username, email, phone, status } = req.body;
    if (!id) {
      res.status(404).json({code: 404, message: `Please Input the account id`});
      return next()
    }
    if(!username || !email || !phone || !status) {
      res.status(400).json({code: 400, message: `Please update the account all of the fields ${username}, ${email}, ${phone}, ${status} is Missing`});
      return next()
    }
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { username, email, phone, status }
      });
      if(user) {
        res.status(200).json({code: 200, user: user, message: `Successfully to update the account ${username}`});
      } else {
        res.status(404).json({code: 404, message: `User not Found`});
        return next()
      }
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to Update User ${username}`});
      return next(error)
    }
  },
  
 deleteUser: async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      res.status(404).json({code: 404, message: `Please Input the account id`});
      return next()
    }
    try {
      await prisma.user.delete({ where: { id } });
      res.status(200).json({code: 200, message: `Successfully to delete the account ${id}`});
      return next()
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: `Failed to Delete User ${id}`});
      return next(error)
    }
  },

  updateProfilePic: async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      res.status(404).json({code: 404, message: `Please Input the account id`});
      return next()
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return next()
    }
    try {
      cloudinary.uploader.upload_stream({ folder: 'profile_pics' }, async (error, result) => {
        if (error) {
          res.status(500).json({ error: 'Failed to upload image' });
          return next()
        }
        const user = await prisma.user.update({
          where: { id },
          data: { profile_pic: result.secure_url }
        });
        res.status(200).json({code: 200, data: user, message: `Successfully to update the avatar account id : ${id}`});
      }).end(req.file.buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
      return next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Please Input the email' });
        return next();
      } else if (!password) {
        res.status(400).json({ error: 'Please Input the password' });
        return next();
      }
      
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return next();
      }
      await prisma.user.update({
        where: { email: email },
        data: { login: true }
      });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid password' });
        return next();
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, login: true },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      await res.json({ token, code: 200, user: user, message: 'Login successful' });   
  
    } catch (error) {
      res.status(500).json({ error: error.message, code: 500 });
      return next(error);
    }
  },
  
  getUserCounts: async (_, res, next) => {
    try {
      const userLoginCount = await prisma.user.count({
        where: { status: 'user', login: true }
      });
      const userUnloggedCount = await prisma.user.count({
        where: { status: 'user', login: false }
      });
      const signerLoginCount = await prisma.user.count({
        where: { status: 'signer', login: true }
      });
      const signerUnloggedCount = await prisma.user.count({
        where: { status: 'signer', login: false }
      });

        res.status(200).json({
          code: 200,
          data: {
            userLoginCount,
            userUnloggedCount,
            signerLoginCount,
            signerUnloggedCount
          },
          message: 'Successfully retrieved user counts'
        });
        return next();
    } catch (error) {
      res.status(500).json({ code: 500, error: error.message, message: 'Failed to retrieve user counts' });
      return next(error);
    }
  },

  logout: async (req, res, next) => {
    const { id } = req.params; // Mengambil userId dari req.params
  
    if (!id) {
      res.status(400).json({ error: 'User ID is required' });
      return next();
    }
    try {
      // Update status login pengguna di database
      await prisma.user.update({
        where: { id: id },
        data: { login: false }
      });
      const user = await prisma.user.findUnique({
        where: { id: id },
      });
  
      // Mengirim respons logout sukses
      await res.status(200).json({ message: 'Logout successful', code: 200, data: user });
      return next();
    } catch (error) {
      res.status(500).json({ error: error.message, code: 500 });
      return next(error);
    }
  }
};

export default userController;
