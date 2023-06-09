/*
 * @Description: 用户相关接口
 */
import { post, prefix, get } from "../requestDecorator";
import userList from "../mockdb/userList";
import * as Koa from 'koa';
import { PRIVITE_KEY } from '../utils/jwt'
import { decrypt } from '../utils/crypto'

import UsersModel from "../mongodb/models/UserSchema";
import { UserSchema, UserInfo, OtherInfo } from "../types/users";

// import { generateToken } from "../utils/jwt";
const jwt = require('jsonwebtoken');


@prefix('/api/user')
export default class User {

  @post('/login')
  async login(ctx: any): Promise<UserInfo | OtherInfo> {
    const username = decrypt(ctx.request.body.username || '')
    const password = decrypt(ctx.request.body.password || '')
    const data = await UsersModel.find({ username: username }, { _id: 0 });
    // 数据库查不到数据说明没有此人。 后面账号密码不用二次验证
    if (data.length == 0) return { err: "账号或密码错误" }
    const userInfo: UserSchema = data[0]
    const _password = userInfo.password?.toString()
    // 密码验证错误
    if (_password !== password) return { err: "密码错误" }
    const token = jwt.sign(
      {
        name: data.username
      },
      PRIVITE_KEY, // secret
      { expiresIn: 60 * 60 } // 60 * 60 s
    );

    // 登录成功返回token
    return {
      userId: userInfo.userId,
      accessToken: token,
      username: userInfo.username,
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
      introduction: userInfo.introduction,
      email: userInfo.email,
      phone: userInfo.phone,
      roles: userInfo.roles
    }
  }

  @get('/userInfo')
  async getUserInfo(ctx: Koa.Context) {
    // let token = ctx.request.header.token
    // return token === 'admin-token' ? userList[0] : userList[1]
    ctx
    return userList[0]

  }

  @get('/getUsers')
  async getUsers(ctx: any) {
    const { name } = ctx.query
    const users = userList.filter(user => {
      const lowerCaseName = user.name.toLowerCase()
      return !(name && lowerCaseName.indexOf((name as string).toLowerCase()) < 0)
    })
    return {
      code: 20000,
      data: {
        items: users
      }
    }
  }
}