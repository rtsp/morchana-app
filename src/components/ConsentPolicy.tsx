import I18n from 'i18n-js'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Row, Table } from 'react-native-table-component'
import { getAgreementTextBody1, getAgreementTextBody2, getAgreementTextBody3 } from '../navigations/const'
import { COLORS, FONT_SIZES } from '../styles'

export default function ConsentPolicy() {
  return (
    <View style={styles.content}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 16,
        }}
      >
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={styles.agreement}>{getAgreementTextBody1()} </Text>
          <ConsentTable
            key={1}
            row={2}
            headerData={[I18n.t('privacy_policy_table_01_header_01'), I18n.t('privacy_policy_table_01_header_02')]}
            rowData={[
              [I18n.t('privacy_policy_table_01_body_01_01'), I18n.t('privacy_policy_table_01_body_01_02')],
              [I18n.t('privacy_policy_table_01_body_02_01'), I18n.t('privacy_policy_table_01_body_02_02')],
              [I18n.t('privacy_policy_table_01_body_03_01'), I18n.t('privacy_policy_table_01_body_03_02')],
            ]}
          />
          <Text style={styles.agreement}>{getAgreementTextBody2()} </Text>
          <ConsentTable
            key={2}
            row={2}
            headerData={[I18n.t('privacy_policy_table_02_header_01'), I18n.t('privacy_policy_table_02_header_02')]}
            rowData={[
              [I18n.t('privacy_policy_table_02_body_01_01'), I18n.t('privacy_policy_table_02_body_01_02')],
              [I18n.t('privacy_policy_table_02_body_02_01'), I18n.t('privacy_policy_table_02_body_02_02')],
              [I18n.t('privacy_policy_table_02_body_03_01'), I18n.t('privacy_policy_table_02_body_03_02')],
              [I18n.t('privacy_policy_table_02_body_04_01'), I18n.t('privacy_policy_table_02_body_04_02')],
              [I18n.t('privacy_policy_table_02_body_05_01'), I18n.t('privacy_policy_table_02_body_05_02')],
            ]}
          />
          <Text style={styles.agreement}>{getAgreementTextBody3()} </Text>
        </View>
      </ScrollView>
    </View>
  )
}

type ConsentTablePropsType = {
  row: number
  rowData: string[][]
  headerData: string[]
}

const ConsentTable = (props: ConsentTablePropsType) => {
  return (
    <View style={styles.tableContainer}>
      <Table>
        <Row style={styles.tableHead} data={props.headerData} />
        {props.rowData.map((data, i) => {
          return <Row key={i} textStyle={styles.tableText} data={data} style={styles.tableRow} />
        })}
      </Table>
    </View>
  )
}

const styles = StyleSheet.create({
  tableContainer: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  tableHead: { padding: 8, backgroundColor: '#f1f8ff' },
  tableText: { margin: 6 },
  tableRow: { alignItems: 'flex-start' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_BLUE,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.BORDER_LIGHT_BLUE,
  },
  agreement: {
    fontSize: FONT_SIZES[400],
    lineHeight: 24,
    color: COLORS.GRAY_4,
    marginBottom: 16,
  },
})
