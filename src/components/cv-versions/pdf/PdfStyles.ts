import { StyleSheet, Font } from '@react-pdf/renderer'

// Register a clean system font fallback — Helvetica is built into PDF spec
// We use it across all templates for ATS compatibility

export const COLORS = {
  black:      '#111111',
  darkGray:   '#333333',
  midGray:    '#555555',
  lightGray:  '#888888',
  border:     '#DDDDDD',
  blue:       '#2563EB',
  blueLight:  '#EFF6FF',
  blueMid:    '#BFDBFE',
  amber:      '#F59E0B',
  white:      '#FFFFFF',
}

// A4 dimensions in pt (72pt = 1 inch)
export const PAGE = {
  width:          595.28,
  height:         841.89,
  marginTop:      36,
  marginBottom:   36,
  marginLeft:     44,
  marginRight:    44,
}

export const base = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.darkGray,
    paddingTop: PAGE.marginTop,
    paddingBottom: PAGE.marginBottom,
    paddingLeft: PAGE.marginLeft,
    paddingRight: PAGE.marginRight,
    lineHeight: 1.4,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.black,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  targetTitle: {
    fontSize: 11,
    color: '#444444',
    marginBottom: 2,
  },
  contactLine: {
    fontSize: 8.5,
    color: COLORS.midGray,
    marginTop: 5,
    lineHeight: 1.4,
  },
  sectionHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.black,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 10,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.border,
    borderBottomStyle: 'solid',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  entryTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.black,
    flex: 1,
  },
  entryMeta: {
    fontSize: 8,
    color: COLORS.lightGray,
    textAlign: 'right',
  },
  entrySubtitle: {
    fontSize: 8,
    color: COLORS.midGray,
    marginBottom: 2,
  },
  bullet: {
    flexDirection: 'row',
    marginTop: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    color: COLORS.midGray,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: COLORS.darkGray,
    lineHeight: 1.5,
  },
  summary: {
    fontSize: 8.5,
    color: COLORS.darkGray,
    lineHeight: 1.55,
    marginTop: 2,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  skillChip: {
    fontSize: 8,
    color: COLORS.darkGray,
    backgroundColor: '#F3F4F6',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    borderStyle: 'solid',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  languageName: {
    fontSize: 8.5,
    color: COLORS.darkGray,
  },
  languageLevel: {
    fontSize: 8,
    color: COLORS.lightGray,
  },
  entryBlock: {
    marginBottom: 10,
  },
})
