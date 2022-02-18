const graphql = require('graphql');
const {UserType} = require('../types/TypeDefs');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = graphql
const NEW_LOGIN = 'NEW_LOGIN';

const newLogin = {
    name: 'newLogin',
    type: UserType,
    subscribe: (_,__,{pubsub}) => 
    {   
       return pubsub.asyncIterator(NEW_LOGIN);
    },
}

const queueUpdate = {
    name: 'queueUpdate',
    type: UserType,
    args : {
        id : {type : GraphQLString}
    },
    subscribe: (_,params,{pubsub}) =>
    {
        return pubsub.asyncIterator(params.id);
    }
}


module.exports = {newLogin,queueUpdate}