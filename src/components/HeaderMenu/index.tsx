import React, { FC, ReactChild } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { Menu, useTheme } from 'react-native-paper';

import { t } from 'i18n';

import styles from './styles';

type HeaderMenuProps = {
  size: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onFlag?: () => void;
  onUnflag?: () => void;
  hasFlag?: boolean;
  onToggleMenu: () => void;
  visible: boolean;
  additional?: ReactChild;
};

const HeaderMenu: FC<HeaderMenuProps> = ({
  size,
  onEdit,
  onDelete,
  onFlag,
  onUnflag,
  hasFlag,
  onToggleMenu,
  visible,
  children,
}) => {
  const {
    colors: { text: textColor },
  } = useTheme();

  if (!onEdit && !onDelete && !onFlag && !onUnflag) {
    return null;
  }

  return (
    <View style={styles.container}>
      {children}
      <Menu
        visible={visible}
        onDismiss={onToggleMenu}
        anchor={
          <Pressable style={styles.ellipsis} onPress={onToggleMenu}>
            <Ionicons name="ellipsis-vertical-sharp" size={size} color={textColor} />
          </Pressable>
        }
      >
        {onEdit && <Menu.Item onPress={onEdit} title={t('edit')} />}
        {onDelete && <Menu.Item onPress={onDelete} title={t('delete')} />}
        {onFlag && hasFlag && <Menu.Item onPress={onUnflag} title={t('unflag')} />}
        {onUnflag && !hasFlag && <Menu.Item onPress={onFlag} title={t('flag')} />}
      </Menu>
    </View>
  );
};

export default HeaderMenu;
