import AsyncStorage from '@react-native-async-storage/async-storage';
import { gql } from '@apollo/client';
import client from './apollo';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
`;

const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
`;

const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
    }
  }
`;

export const login = async (email: string, password: string) => {
  const { data } = await client.mutate({
    mutation: LOGIN,
    variables: { email, password }
  });
  
  await AsyncStorage.setItem('token', data.login.token);
  await AsyncStorage.setItem('refreshToken', data.login.refreshToken);
  
  return data.login;
};

export const register = async (name: string, email: string, password: string) => {
  const { data } = await client.mutate({
    mutation: REGISTER,
    variables: { name, email, password }
  });
  
  await AsyncStorage.setItem('token', data.register.token);
  await AsyncStorage.setItem('refreshToken', data.register.refreshToken);
  
  return data.register;
};

export const refreshToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }
  
  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN,
      variables: { refreshToken }
    });
    
    await AsyncStorage.setItem('token', data.refreshToken.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken.refreshToken);
    
    return data.refreshToken;
  } catch (error) {
    // If refresh token is invalid, log the user out
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    throw error;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('refreshToken');
};
