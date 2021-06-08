import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntIcon from 'react-native-vector-icons/AntDesign'
import { getNotifications } from '../../api-notification'
import { MyBackground } from '../../components/MyBackground'
import { COLORS, FONT_FAMILY, FONT_SIZES } from '../../styles'

export interface NotificationHistoryModel {
  title: string
  type: string
  message: string
  sendedAt: string
  anonymousId: string
  isRead: true
}

const PAGE_SIZE = 20
// let cnt = 0

export const NotificationHistory = () => {
  const [history, setHistory] = useState<NotificationHistoryModel[]>([])
  const [endOfList, setEndOfList] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const historyRef = React.useRef(history)
  historyRef.current = history

  /*
  const getNotifications = useCallback(
    () =>
      new Promise<NotificationHistoryModel[]>((success) =>
        _.debounce(() => {
          cnt++
          if (cnt > 4) {
            success([])
            return
          }
          
          const mockHistory: NotificationHistoryModel[] = [
            {
              type: 'ALERT',
              title: 'ด่วน กรุณาโทรกลับ',
              message:
                'กรมควบคุมโรคต้องการติดต่อคุณ กรุณาติดต่อกลับด้วยที่เบอร์ 0821920192',
              sendedAt: new Date().toISOString(),
            },
            {
              type: 'INFO',
              title: 'กรอกแบบสอบถาม',
              message:
                'กรุณากรอกแบบสอบถามความพึงพอใจการใช้งาน Link: bitly.com/xieoak',
              sendedAt: new Date().toISOString(),
            },
            {
              type: 'ALERT',
              title: 'สถานะความเสี่ยงถูกเปลี่ยน',
              message:
                'สถานะการติดเชื้อถูกเปลี่ยนเป็น “เสี่ยงมาก” (สีแดง) คลิกเพื่ออ่านสาเหตุ',
              sendedAt: new Date().toISOString(),
            },
          ]
          success(mockHistory)
        }, 1000)(),
      ),
    [],
  )
  */

  useEffect(() => {
    getNotifications({ skip: 0, limit: PAGE_SIZE }).then(setHistory)
  }, [])

  return (
    <MyBackground variant="light">
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.PRIMARY_LIGHT}
        />
        <FlatList
          data={history}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true)
            const notifications = await getNotifications({
              skip: 0,
              limit: PAGE_SIZE,
            })
            setHistory(notifications)
            setEndOfList(false)
            setRefreshing(false)
          }}
          onEndReachedThreshold={0.5}
          onEndReached={async () => {
            if (endOfList) return
            const newHistory = await getNotifications({
              skip: historyRef.current.length,
              limit: PAGE_SIZE,
            })
            if (newHistory.length) {
              setHistory(historyRef.current.concat(newHistory))
            } else {
              setEndOfList(true)
            }
          }}
          renderItem={({ item, index }) => {
            return (
              <View style={styles.sectionLine} key={'c' + index}>
                <View style={styles.titleSection}>
                  <View>
                    <AntIcon
                      style={styles.iconStyle}
                      name={item.type === 'ALERT' ? 'warning' : 'infocirlceo'}
                      color={
                        item.type === 'ALERT'
                          ? COLORS.RED_WARNING
                          : COLORS.BLUE_INFO
                      }
                      size={16}
                    />
                  </View>
                  <View>
                    <Text
                      style={
                        item.type === 'ALERT'
                          ? styles.titleWarning
                          : styles.titleInfo
                      }
                    >
                      {item.title}
                    </Text>
                  </View>
                </View>
                <Text style={styles.descriptionStyle}>{item.message}</Text>
                <Text style={styles.dateStyle}>
                  {moment(item.sendedAt)
                    .format('DD MMM YYYY HH:mm น.')
                    .toString()}
                </Text>
              </View>
            )
          }}
        />
      </SafeAreaView>
    </MyBackground>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  sectionLine: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_5,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
  },
  titleWarning: {
    color: COLORS.RED_WARNING,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_FAMILY,
    fontWeight: '500',
  },
  titleInfo: {
    color: COLORS.BLUE_INFO,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_FAMILY,
    fontWeight: '500',
  },
  iconStyle: {
    position: 'relative',
    top: 4,
    paddingRight: 12,
  },
  descriptionStyle: {
    color: COLORS.BLACK_1,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_FAMILY,
  },
  dateStyle: {
    color: COLORS.GRAY_4,
    fontSize: FONT_SIZES[400],
    fontFamily: FONT_FAMILY,
  },
})
