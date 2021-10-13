import { Surface, HelperText, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, View, FlatList } from 'react-native';
import React, { VFC, useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  runQuery,
  createQuery,
  queryMessages,
  observeMessages,
  sortByChannelSegment,
} from '@amityco/ts-sdk';

import { Header, MessageItem, Loading } from 'components';

import { t } from 'i18n';
import useAuth from 'hooks/useAuth';
import getErrorMessage from 'utils/getErrorMessage';

import { DrawerStackHeaderProps } from 'types';

import styles from './styles';

const QUERY_LIMIT = 10;

const ChatScreen: VFC = () => {
  const flatList = useRef(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, Amity.Message>>({});

  const [{ error, prevPage }, setMetadata] = useState<Amity.QueryMetadata & Amity.Pages>({
    nextPage: null,
    prevPage: null,
  });

  const route = useRoute();
  const { client } = useAuth();
  const navigation = useNavigation();

  const {
    channel: { displayName, channelId },
  } = route.params as { channel: Amity.Channel };

  const userId = client.userId ?? '';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: displayName ?? channelId,
      header: ({ scene, previous, navigation: nav }: DrawerStackHeaderProps) => (
        <Header scene={scene} navigation={nav} previous={previous} />
      ),
    });
  }, [channelId, displayName, navigation]);

  useEffect(() =>
    observeMessages(channelId, message => {
      setMessages(prevState => ({ ...prevState, [message.localId]: message }));
    }),
  );

  const onQueryMessages = useCallback(
    async ({ reset = false, page = { limit: QUERY_LIMIT } }) => {
      const queryData = {
        page,
        channelId,
      };

      runQuery(
        createQuery(queryMessages, queryData),
        ({ data, loading: loading_, ...metadata }) => {
          if (reset) setMessages({});
          if (data) {
            setMessages(prevMessages => ({ ...prevMessages, ...data }));

            // @ts-ignore
            setMetadata(metadata);
          }

          if (!loading_) {
            setLoading(false);
          }
        },
      );
    },
    [channelId],
  );

  useEffect(() => {
    onQueryMessages({ reset: true });
  }, [onQueryMessages]);

  const handleLoadMore = () => {
    if (prevPage) {
      setLoading(true);
      onQueryMessages({ page: prevPage });
    }
  };

  const data = Object.values(messages).sort(sortByChannelSegment).reverse();

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <MessageItem message={item} previousMessage={data[index + 1]} currentUserId={userId} />
      );
    },
    [data, userId],
  );

  const renderFooter = () => {
    if (!loading) {
      return null;
    }

    return (
      <View style={styles.loading}>
        <Loading />
      </View>
    );
  };

  const keyExtractor = (item: Amity.Message) => item.messageId.toString();

  const errorText = getErrorMessage(error);

  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior="padding"
        enabled={Platform.OS === 'ios'}
      >
        {error ? (
          <HelperText type="error" style={styles.errorText}>
            {errorText}
          </HelperText>
        ) : (
          <FlatList
            inverted
            data={data}
            ref={flatList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReachedThreshold={0.3}
            onEndReached={handleLoadMore}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !loading ? <Text style={styles.emptyMessage}>{t('chat.emptyMessage')}</Text> : null
            }
          />
        )}
      </KeyboardAvoidingView>
    </Surface>
  );
};

export default ChatScreen;