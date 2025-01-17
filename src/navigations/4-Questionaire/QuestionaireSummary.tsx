import styled from '@emotion/native'
import React from 'react'
import { ActivityIndicator, Dimensions, Image, StatusBar, Text, View } from 'react-native'
import { useSafeArea } from 'react-native-safe-area-view'
import Icon from 'react-native-vector-icons/Entypo'
import { WhiteText } from '../../components/Base'
import { PrimaryButton } from '../../components/Button'
import { FormHeader } from '../../components/Form/FormHeader'
import { QR_STATE, useSelfQR } from '../../state/qr'
import { COLORS, FONT_FAMILY, FONT_SIZES, FONT_BOLD } from '../../styles'
import { useResetTo } from '../../utils/navigation'
import { isSmallDevice } from '../../utils/responsive'
import { Button } from 'react-native-elements'

import I18n from '../../../i18n/i18n'

const Container = styled(View)({
  backgroundColor: '#00A0D7',
  height: '100%',
})

const Content = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
`

const Card = styled.View`
  background-color: white;
  border-radius: 16px;
  align-items: center;
  max-width: 360px;
  padding: 16px;
`

const risks = [
  { text: I18n.t('very_low'), color: COLORS.GREEN },
  { text: I18n.t('low'), color: COLORS.YELLOW },
  { text: Dimensions.get('window').width < 360 ? I18n.t('medium') : I18n.t('med_panklang'), color: COLORS.ORANGE },
  { text: I18n.t('very_high'), color: COLORS.RED },
]

const RiskLevel = ({ level }) => {
  console.log({ level })
  const indicatorMargin = `${(level - 1) * 25}%`
  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View
        style={{
          borderRadius: 16,
          height: 32,
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        {risks.map((risk) => (
          <View
            key={risk.text}
            style={{
              backgroundColor: risk.color,
              flex: 1,
              alignItems: 'center',
            }}
          >
            <WhiteText style={{ fontSize: FONT_SIZES[600] }}>{risk.text}</WhiteText>
          </View>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignSelf: 'stretch',
        }}
      >
        <View
          style={{
            marginLeft: indicatorMargin,
            width: '25%',
            alignItems: 'center',
          }}
        >
          <Icon name='triangle-up' color='black' size={24} />
        </View>
      </View>
    </View>
  )
}

export const QuestionaireSummary = ({ navigation }) => {
  const resetTo = useResetTo()
  const inset = useSafeArea()
  const { qrData, qrState, error, refreshQR } = useSelfQR()
  // useEffect(() => {
  //   resetTo({ name: 'MainApp' })
  // }, [])
  return (
    <Container>
      <StatusBar backgroundColor='#00A0D7' barStyle='light-content' />
      <FormHeader whiteLogo style={{ paddingTop: inset.top }} />
      {qrState === QR_STATE.LOADING ? (
        <ActivityIndicator />
      ) : (
        <Content style={{ marginBottom: inset.bottom }}>
          <Image
            source={require('./assets/smile-doctor.png')}
            style={{
              width: Math.floor(Dimensions.get('window').width * 0.5),
              height: Math.floor((1578 / 1370) * Dimensions.get('window').width * 0.5),
            }}
            resizeMode='cover'
          />
          <Card>
            <Text
              style={{
                fontSize: isSmallDevice ? FONT_SIZES[800] : FONT_SIZES[900],
                fontFamily: FONT_BOLD,
                color: qrData.getStatusColor(),
              }}
            >
              {qrData.getLabel()}
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES[600],
                fontFamily: FONT_FAMILY,
                color: 'black',
              }}
            >
              {I18n.t('doc_will_give_u_qr')}
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES[600],
                fontFamily: FONT_FAMILY,
                color: 'black',
              }}
            >
              {I18n.t('for_risk_assessment')}
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES[600],
                marginTop: 8,
                marginBottom: 4,
                fontFamily: FONT_FAMILY,
                color: '#576675',
              }}
            >
              {I18n.t('risk_level')}
            </Text>
            <RiskLevel level={qrData.getLevel()} />
            <View
              style={{
                marginTop: 4,
                alignSelf: 'stretch',
              }}
            >
              <PrimaryButton
                title={I18n.t('receive_qr_code')}
                style={{
                  width: '100%',
                }}
                containerStyle={{
                  width: '100%',
                }}
                onPress={async () => {
                  resetTo({ name: 'MainApp' })
                }}
              />
              <Button
                title={I18n.t('do_questionnaire_again')}
                style={{
                  width: '100%',
                }}
                type='clear'
                titleStyle={{
                  fontFamily: FONT_FAMILY,
                  fontSize: FONT_SIZES[600],
                }}
                containerStyle={{
                  marginTop: 4,
                  width: '100%',
                }}
                onPress={async () => {
                  resetTo({ name: 'Questionaire' })
                }}
              />
            </View>
          </Card>
        </Content>
      )}
    </Container>
  )
}
