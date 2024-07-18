import { NextFunction, Request, Response } from "express";
import cookie from "cookie"
import { v4 as uuid } from "uuid"

require('dotenv').config()

async function loginController(req: Request, res: Response, next: NextFunction) {

}

async function authCallBackController(req: Request, res: Response, next: NextFunction) {

}

async function getProfileController(req:Request,res:Response) {

}

export {loginController, authCallBackController, getProfileController }
