import React, { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '~/services/api';
import getRealm from '~/services/realm';

import Repository from '~/components/Repository';

import {
  Container, Title, Form, Input, Submit, List,
} from './styles';

export default function Main() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    async function loadRepositories() {
      const realm = await getRealm();
      const data = realm.objects('Repository').sorted('name');
      setRepositories(data);
    }

    loadRepositories();
  }, [repositories]);

  async function removeAllRepository() {
    const realm = await getRealm();
    realm.write(() => {
      const allRepositories = realm.objects('Repository');
      realm.delete(allRepositories);
    });
  }

  async function saveRepository(repository) {
    const data = {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description === null ? '' : repository.description,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
    };

    const realm = await getRealm();
    realm.write(() => {
      realm.create('Repository', data);
    });
  }

  function handleRemoveRepositories() {
    removeAllRepository();
  }

  async function handleAddRepositories() {
    try {
      const response = await api.get(`users/${input}/repos?page=0&per_page=5`);
      response.data.map(repo => saveRepository(repo));
      setInput('');
      Keyboard.dismiss();
    } catch (err) {
      setError(true);
    }
  }

  return (
    <Container>
      <Title>Repositórios</Title>

      <Form>
        <Input
          value={input}
          error={error}
          onChangeText={text => setInput(text)}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Digite usuário github..."
        />
        <Submit onPress={handleAddRepositories}>
          <Icon name="add" size={22} color="#FFF" />
        </Submit>
        <Submit onPress={handleRemoveRepositories}>
          <Icon name="remove" size={22} color="#FFF" />
        </Submit>
      </Form>
      <List
        keyboardShouldPersistTaps="handled"
        data={repositories}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Repository data={item} />
        )}
      />
    </Container>
  );
}
