import React from 'react'
import { View, StyleSheet, Text, StatusBar } from 'react-native'
import { COLORS, FONT_FAMILY, FONT_BOLD } from '../styles'
import SafeAreaView from 'react-native-safe-area-view'

import { useNavigation } from '@react-navigation/native'
import { PrimaryButton } from '../components/Button'
import { MyBackground } from '../components/MyBackground'
import { Title } from '../components/Base'

import I18n from '../../i18n/i18n'

export const MockScreen = ({
  title,
  content,
  nextScreen,
  onNext,
  disabledNext,
}: {
  title: string
  content?: React.ReactChild | React.ReactChildren
  nextScreen?: string
  disabledNext?: boolean
  onNext?: (e: any) => any
}) => {
  const navigation = useNavigation()
  return (
    <MyBackground variant='light'>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle='dark-content' />
        <View style={styles.header}>
          <Title>{title}</Title>
        </View>
        <View style={styles.content}>{content}</View>
        {(nextScreen || onNext) && (
          <View style={styles.footer}>
            <PrimaryButton
              title={I18n.t('next')}
              onPress={
                onNext
                  ? onNext
                  : () => {
                      navigation.navigate(nextScreen)
                    }
              }
              disabled={disabledNext}
            />
          </View>
        )}
      </SafeAreaView>
    </MyBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontFamily: FONT_BOLD,
    fontSize: 24,
    lineHeight: 40,
    alignItems: 'center',
    color: COLORS.PRIMARY_LIGHT,
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 12,
  },
})
