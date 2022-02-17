var { GraphQLNonNull, GraphQLString, GraphQLBoolean } = require("graphql");
const { UserType } = require("../types/TypeDefs");
const User = require("../../../models/UserModel");
const Channel = require("../../../models/ChannelModel");
const Facilitator = require("../../../models/FacilitatorModel");
const generateToken = require("../../../utils/GenerateToken");

const addUser = {
  type: UserType,
  args: {
    first_name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    last_name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async function (root, params, { req, res }) {
    console.log("params", params);
    let user = await User.findOne({ email: params.email });
    if (user) {
      console.log("userexist");
      res.status(400);
      throw new Error("User already exists!");
    }
    const userModel = new User(params);
    const newUser = await userModel.save();
    if (!newUser) {
      throw new Error("Error");
    }
    return newUser;
  },
};

const updateUser = {
  type: UserType,
  args: {
    _id: {
      name: "_id",
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      name: "name",
      type: GraphQLString,
    },
    email: {
      name: "email",
      type: GraphQLString,
    },
  },
  resolve: async function (root, param) {
    let updateUser = {};
    if (param.name) {
      updateUser.name = param.name;
    }
    if (param.email) {
      updateUser.email = param.email;
    }
    const uUser = await User.findByIdAndUpdate(param._id, updateUser, {
      new: true,
    });
    console.log(uUser);
    if (!uUser) {
      throw new Error("Error");
    }
    return uUser;
  },
};
const NEW_LOGIN = "NEW_LOGIN";
const login = {
  name: "login",
  type: UserType,
  args: {
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  resolve: async function (root, params, { req, res, pubsub }) {
    const user = await User.findOne({ email: params.email });
    if (!user || !(await user.isMatchPassword(params.password))) {
      console.log("error", user);
      res.status(400);
      throw new Error("Invalid email or password");
    } else {
      let convertedUser = user.toJSON();
      convertedUser.token = generateToken(convertedUser._id);
      delete convertedUser.password;
      user.is_in_queue = false;
      user.is_assigned = false;

      user.save();

      //   console.log("convertedUser",pubsub.subscriptions['1'][1])
      pubsub.publish(NEW_LOGIN, { newLogin: { _id: "123" } });

      return convertedUser;
    }
  },
};

const joinChannel = {
  name: "joinChannel",
  type: UserType,
  args: {
    _id: { type: GraphQLString },
    channel_id: { type: GraphQLString },
  },
  resolve: async function (root, params, { req, res }) {
    const newUser = await User.findOneAndUpdate(
      { _id: params._id },
      {
        $addToSet: {
          channels: params.channel_id,
        },
      },
      {
        new: true,
      }
    );
    return newUser;
  },
};

const enterQueue = {
  name: "enterQueue",
  type: UserType,
  args: {
    _id: { type: GraphQLString },
  },
  resolve: async function (root, params, { req, res }) {


    let channel = new Channel({
      channel_name: params._id,
      user : params._id,
      facilitator : null,
    });

    let newChannel = await channel.save();

    const newUser = await User.findOneAndUpdate(
      { _id: params._id },
      {
        $set: {
          is_in_queue: true,
          channel: newChannel._id,
        },
      },
      {
        new: true,
      }
    );

    if (!newUser) {
      res.status(401);
      
      throw new Error("Error in entering queue");
    }

    return newUser;
  },
};

const leaveQueue = {
  name: "leaveQueue",
  type: UserType,
  args: {
    _id: { type: GraphQLString },
  },
  resolve: async function (root, params, { req, res }) {
    const newUser = await User.findOneAndUpdate(
      { _id: params._id },
      {
        $set: {
          is_in_queue: false,
          is_assigned: false,
          channel: null,
        },
      },
      {
        new: true,
      }
    );
    return newUser;
  },
};

const assignedTo = {
  name: "assignedTo",
  type: UserType,
  args: {
    _id: { type: GraphQLString },
    assigned_to: { type: GraphQLString },
  },
  resolve: async function (root, params, { req, res }) {

    let channel = new Channel({
      name: "test",
      created_by: params.assigned_to,
      users: [params.assigned_to, params._id],
    });

    channel = await channel.save();

    const newUser = await User.findOneAndUpdate(
      { _id: params._id },
      {
        $set: {
          assigned_to: params.assigned_to,
          is_in_queue: false,
        },
      },
      {
        new: true,
      }
    );
    const assignedFacilitator = await Facilitator.findOne({
      _id: params.assigned_to,
    });

    if (!assignedFacilitator) {
      throw new Error("Facilitator not found");
    }

    if (!newUser) {
      throw new Error("User not found");
    }

    newUser.assigned_to = assignedFacilitator;
    return newUser;
  },
};

// const deleteUser = {
//     type: UserType,
//     args: {
//         _id: {
//             name: '_id',
//             type: new GraphQLNonNull(GraphQLString)
//         }
//     },
//     resolve: async function (root, param) {
//       const deleteUser =  await User.findByIdAndRemove(param._id)
//       if(!deleteUser) {
//          throw new Error('Error');
//       }
//       return deleteUser
//     }
// }



module.exports = {
  addUser,
  updateUser,
  login,
  joinChannel,
  enterQueue,
  leaveQueue,
  assignedTo,
};
