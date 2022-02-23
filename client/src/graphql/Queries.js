import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query {
    getUsers {
      _id
      email
      first_name
      last_name
    }
  }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      _id
      first_name
      last_name
      email
      token
    }
  }
`;

export const FACILITATOR_LOGIN = gql`
  mutation LoginFacilitator($email: String, $password: String) {
    loginFacilitator(email: $email, password: $password) {
      _id
      first_name
      last_name
      is_available
      is_assigned
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessagesFromChannel($channelId: String!) {
    getMessagesFromChannel(channel_id: $channelId) {
      _id
      text
      sender
      sender_name
    }
  }
`;

export const GET_USERS_IN_QUEUE = gql`
  query GetUsersInQueue {
    getUsersInQueue {
      _id
      first_name
      last_name
      channel_id
    }
  }
`;

export const GET_USER = gql`
  query GetUser($userId: String) {
    getUser(userId: $userId) {
      is_in_queue
      is_assigned
      action
      channel_id
    }
  }
`;
