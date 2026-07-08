import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { RESUME_BODY_FONT, RESUME_TITLE_FONT } from '../resume-font-family';
import { extractYear } from './utils';

const BODY_FONT = RESUME_BODY_FONT;
const TITLE_FONT = RESUME_TITLE_FONT;

const GRAY = {
    textDark: '#1a1a1a',
    textMedium: '#404040',
    textLight: '#6b6b6b',
};

const STYLE_CACHE_VERSION = 4;
const styleCache = new Map();

function cacheKey(config, headerLayout) {
    return `${STYLE_CACHE_VERSION}:${headerLayout}:${JSON.stringify(config.fonts || {})}:${JSON.stringify(config.theme || {})}:${JSON.stringify(config.sectionTitles || {})}`;
}

function createStyles(config, headerLayout) {
    const key = cacheKey(config, headerLayout);
    if (styleCache.has(key)) {
        return styleCache.get(key);
    }

    const { fonts = {}, theme = {}, sectionTitles = {} } = config;
    const accent = theme.accent || '#1a1a1a';
    const isSplit = headerLayout === 'split';
    const isLeft = headerLayout === 'left';
    const sectionSpacing = theme.sectionSpacing ?? 12;
    const companyItalic = theme.companyItalic !== false;

    const styles = StyleSheet.create({
        page: {
            padding: theme.pagePadding || '15mm',
            fontSize: fonts.baseSize || 11,
            fontFamily: fonts.body || BODY_FONT,
            color: GRAY.textDark,
        },
        header: {
            textAlign: isSplit || isLeft ? 'left' : 'center',
            marginBottom: theme.headerStyle === 'compact' ? 10 : 14,
            paddingBottom: theme.headerStyle === 'minimal' ? 4 : 10,
            borderBottomWidth: ['standard', 'double-rule'].includes(theme.headerStyle) ? 1 : 0,
            borderBottomColor: accent,
        },
        headerDoubleRule: {
            borderBottomWidth: 3,
            borderBottomColor: accent,
            paddingBottom: 8,
            marginBottom: 4,
        },
        headerThinRule: {
            borderBottomWidth: 0.5,
            borderBottomColor: GRAY.textLight,
            paddingBottom: 8,
        },
        headerBanner: {
            backgroundColor: accent,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginBottom: 14,
        },
        headerAccentBar: {
            borderLeftWidth: 4,
            borderLeftColor: accent,
            paddingLeft: 10,
            marginBottom: 12,
        },
        headerBoldName: {
            borderBottomWidth: 4,
            borderBottomColor: accent,
            paddingBottom: 8,
            marginBottom: 10,
        },
        headerCreative: {
            textAlign: isSplit || isLeft ? 'left' : 'center',
            marginBottom: 14,
            paddingBottom: 0,
        },
        creativeHeaderRuleWrap: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 8,
            width: '100%',
        },
        creativeHeaderRuleLine: {
            width: 70,
            height: 1,
            backgroundColor: accent,
        },
        creativeHeaderRuleMark: {
            width: 5,
            height: 5,
            backgroundColor: accent,
            marginHorizontal: 10,
        },
        headerContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        headerLeft: { flex: 1 },
        name: {
            fontSize: fonts.nameSize || 24,
            fontFamily: fonts.title || TITLE_FONT,
            fontWeight: 'bold',
            marginBottom: 3,
            color: theme.headerStyle === 'banner' ? '#ffffff' : '#000000',
            textTransform: theme.nameUppercase ? 'uppercase' : 'none',
            letterSpacing: theme.nameLetterSpacing || 0,
        },
        title: {
            fontSize: fonts.titleSize || 11,
            fontFamily: fonts.body || BODY_FONT,
            fontWeight: fonts.titleWeight || 'normal',
            marginBottom: 6,
            color: theme.headerStyle === 'banner' ? '#e8e8e8' : GRAY.textMedium,
        },
        contact: {
            fontSize: fonts.contactSize || 9.5,
            fontFamily: fonts.body || BODY_FONT,
            color: theme.headerStyle === 'banner' ? '#d0d0d0' : GRAY.textLight,
            lineHeight: 1.4,
            textAlign: isSplit ? 'right' : isLeft ? 'left' : 'center',
        },
        contactBanner: {
            color: '#d0d0d0',
            textAlign: 'center',
        },
        contactItem: {
            marginBottom: isSplit || isLeft || theme.headerStyle === 'compact' ? 2 : 0,
        },
        section: {
            marginBottom: sectionSpacing / 2,
        },
        sectionTitleBase: {
            fontSize: fonts.sectionSize || 10,
            fontFamily: fonts.title || TITLE_FONT,
            fontWeight: 'bold',
            color: theme.sectionStyle === 'pill' ? '#ffffff' : accent,
            marginBottom: 8,
        },
        sectionTitleUnderline: {
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            paddingBottom: 4,
            borderBottomWidth: 1,
            borderBottomColor: accent,
        },
        sectionTitleDouble: {
            textTransform: 'uppercase',
            letterSpacing: 1,
            paddingBottom: 3,
            borderBottomWidth: 2,
            borderBottomColor: accent,
            marginBottom: 2,
        },
        sectionTitleLeftBar: {
            textTransform: 'uppercase',
            letterSpacing: 1,
            paddingLeft: 8,
            borderLeftWidth: 3,
            borderLeftColor: accent,
        },
        sectionTitlePill: {
            textTransform: 'uppercase',
            letterSpacing: 1,
            backgroundColor: accent,
            paddingVertical: 4,
            paddingHorizontal: 8,
            alignSelf: 'flex-start',
        },
        sectionTitleThick: {
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            paddingBottom: 5,
            borderBottomWidth: 2.5,
            borderBottomColor: accent,
        },
        sectionTitleLabeled: {
            fontStyle: 'italic',
            textTransform: 'none',
            letterSpacing: 0,
            fontSize: (fonts.sectionSize || 10) + 1,
            color: GRAY.textDark,
            marginBottom: 4,
        },
        sectionTitleAccentMark: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        sectionTitleAccentMarkBar: {
            width: 4,
            height: 13,
            backgroundColor: accent,
            marginRight: 8,
        },
        sectionTitleAccentMarkText: {
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            color: accent,
            marginBottom: 0,
        },
        sectionTitleMinimal: {
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: GRAY.textDark,
            marginBottom: 5,
        },
        sectionTitleSpaced: {
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            fontSize: (fonts.sectionSize || 10) - 0.5,
            marginBottom: 10,
            color: accent,
        },
        sectionTitleThin: {
            textTransform: 'uppercase',
            letterSpacing: 1.8,
            paddingBottom: 3,
            borderBottomWidth: 0.5,
            borderBottomColor: GRAY.textLight,
        },
        summary: {
            fontSize: fonts.summarySize || 10.5,
            fontFamily: fonts.body || BODY_FONT,
            lineHeight: theme.summaryItalic ? 1.65 : 1.6,
            textAlign: 'left',
            color: GRAY.textDark,
            fontStyle: theme.summaryItalic ? 'italic' : 'normal',
        },
        skillsCategory: {
            marginBottom: theme.sectionStyle === 'minimal' ? 2 : 4,
            width: '100%',
        },
        skillsLabel: {
            fontSize: fonts.skillsLabelSize || 9.5,
            fontFamily: fonts.title || TITLE_FONT,
            fontWeight: 'bold',
            color: GRAY.textDark,
            marginBottom: 3,
            textTransform: theme.sectionStyle === 'labeled' ? 'none' : 'uppercase',
            letterSpacing: 0.8,
        },
        skillsList: {
            fontSize: fonts.skillsListSize || 9.5,
            fontFamily: fonts.body || BODY_FONT,
            color: GRAY.textMedium,
            lineHeight: 1.5,
        },
        expItem: {
            marginBottom: theme.sectionStyle === 'minimal' ? 7 : 10,
        },
        expHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 1,
        },
        expHeaderStacked: {
            marginBottom: 2,
        },
        expTitle: {
            fontSize: fonts.expTitleSize || 10.5,
            fontFamily: fonts.title || TITLE_FONT,
            fontWeight: 'bold',
            color: '#000000',
        },
        expDates: {
            fontSize: fonts.expDatesSize || 9.5,
            fontFamily: fonts.body || BODY_FONT,
            color: GRAY.textMedium,
            fontWeight: 'normal',
        },
        expDatesBelow: {
            fontSize: fonts.expDatesSize || 9,
            fontFamily: fonts.body || BODY_FONT,
            color: accent,
            marginBottom: 2,
        },
        expCompany: {
            fontSize: fonts.expCompanySize || 10,
            fontFamily: fonts.body || BODY_FONT,
            color: GRAY.textMedium,
            marginBottom: 3,
            fontStyle: companyItalic ? 'italic' : 'normal',
        },
        expDetails: {
            marginLeft: theme.sectionStyle === 'minimal' ? 10 : 14,
        },
        expDetailItem: {
            fontSize: fonts.expDetailSize || 10,
            fontFamily: fonts.body || BODY_FONT,
            lineHeight: 1.45,
            marginBottom: 2,
            color: GRAY.textDark,
        },
        eduItem: {
            marginBottom: 8,
        },
        eduHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 1,
        },
        eduDegree: {
            fontSize: fonts.eduDegreeSize || 10.5,
            fontFamily: fonts.title || TITLE_FONT,
            fontWeight: 'bold',
            color: '#000000',
        },
        eduDates: {
            fontSize: fonts.eduDatesSize || 9.5,
            fontFamily: fonts.body || BODY_FONT,
            color: GRAY.textMedium,
            fontWeight: 'normal',
        },
        eduSchool: {
            fontSize: fonts.eduSchoolSize || 10,
            fontFamily: fonts.body || BODY_FONT,
            color: GRAY.textMedium,
            fontStyle: 'italic',
        },
    });

    const result = { styles, sectionTitles, theme, accent };
    styleCache.set(key, result);
    return result;
}

function resolveHeaderLayout(data, defaultLayout) {
    const fromData = data?.headerLayout;
    if (fromData === 'center' || fromData === 'split' || fromData === 'left') {
        return fromData;
    }
    return defaultLayout || 'center';
}

function sectionTitleStyleKeys(sectionStyle) {
    const map = {
        underline: 'sectionTitleUnderline',
        'double-underline': 'sectionTitleDouble',
        'left-bar': 'sectionTitleLeftBar',
        pill: 'sectionTitlePill',
        'thick-rule': 'sectionTitleThick',
        labeled: 'sectionTitleLabeled',
        diamond: 'sectionTitleAccentMark',
        'accent-mark': 'sectionTitleAccentMark',
        minimal: 'sectionTitleMinimal',
        'spaced-caps': 'sectionTitleSpaced',
        'thin-rule': 'sectionTitleThin',
    };
    return map[sectionStyle] || 'sectionTitleUnderline';
}

function SectionTitle({ label, styles, theme }) {
    const variantKey = sectionTitleStyleKeys(theme.sectionStyle);
    const base = [styles.sectionTitleBase, styles[variantKey]];

    if (theme.sectionStyle === 'diamond' || theme.sectionStyle === 'accent-mark') {
        return (
            <View style={styles.sectionTitleAccentMark}>
                <View style={styles.sectionTitleAccentMarkBar} />
                <Text style={[styles.sectionTitleBase, styles.sectionTitleAccentMarkText]}>
                    {label}
                </Text>
            </View>
        );
    }

    return <Text style={base}>{label}</Text>;
}

export const createResumeTemplate = (config) => {
    const baseConfig = config;
    const defaultHeaderLayout = config.headerLayout || 'center';
    const theme = config.theme || {};
    const bullet = theme.bullet || '•';

    const TemplateComponent = ({ data }) => {
        const headerLayout = resolveHeaderLayout(data, defaultHeaderLayout);
        const { styles, sectionTitles, theme: resolvedTheme } = useMemo(
            () => createStyles(baseConfig, headerLayout),
            [headerLayout]
        );
        const t = resolvedTheme;
        const expDatesBelow = t.expDatesBelow === true;

        const {
            name,
            title: jobTitle,
            email,
            phone,
            location,
            linkedin,
            website,
            summary,
            skills,
            experience,
            education,
        } = data;

        const formatContactText = (key, value) => {
            if (!value) {
                return value;
            }

            const normalized = String(value).trim();
            if (!normalized) {
                return value;
            }

            if (key === 'linkedin') {
                return 'LinkedIn';
            }

            if (key === 'website') {
                try {
                    const parsed = new URL(normalized);
                    return parsed.hostname.replace(/^www\./i, '');
                } catch {
                    return normalized;
                }
            }

            return normalized;
        };

        const renderContactLineItem = (item, style) => {
            if (item.url) {
                return (
                    <Link key={item.key} src={item.url} style={style}>
                        {item.text}
                    </Link>
                );
            }

            return (
                <Text key={item.key} style={style}>
                    {item.text}
                </Text>
            );
        };

        const renderContactLines = (asBlock, banner = false) => {
            const items = [
                email && { key: 'email', text: email },
                phone && { key: 'phone', text: phone },
                location && { key: 'location', text: location },
                linkedin && { key: 'linkedin', text: formatContactText('linkedin', linkedin), url: linkedin },
                website && { key: 'website', text: formatContactText('website', website), url: website },
            ].filter(Boolean);

            const contactStyle = banner
                ? [styles.contact, styles.contactBanner]
                : styles.contact;

            if (asBlock) {
                return items.map((item) => renderContactLineItem(item, [contactStyle, styles.contactItem]));
            }

            const parts = items.flatMap((item, index) => {
                const content = renderContactLineItem(item, contactStyle);
                return index === items.length - 1 ? [content] : [content, ' • '];
            });

            return <Text style={contactStyle}>{parts}</Text>;
        };

        const renderCreativeHeaderRule = () => (
            <View style={styles.creativeHeaderRuleWrap}>
                <View style={styles.creativeHeaderRuleLine} />
                <View style={styles.creativeHeaderRuleMark} />
                <View style={styles.creativeHeaderRuleLine} />
            </View>
        );

        const renderHeader = () => {
            const headerStyle = t.headerStyle || 'standard';

            if (headerStyle === 'banner') {
                return (
                    <View style={styles.headerBanner}>
                        <Text style={styles.name}>{name}</Text>
                        {jobTitle && <Text style={styles.title}>{jobTitle}</Text>}
                        {renderContactLines(false, true)}
                    </View>
                );
            }

            const wrapHeader = (content) => {
                if (headerStyle === 'double-rule') {
                    return <View style={[styles.header, styles.headerDoubleRule]}>{content}</View>;
                }
                if (headerStyle === 'bold-name') {
                    return <View style={styles.headerBoldName}>{content}</View>;
                }
                if (headerStyle === 'accent-bar' && headerLayout === 'split') {
                    return (
                        <View style={styles.headerAccentBar}>
                            <View style={styles.headerContent}>{content}</View>
                        </View>
                    );
                }
                if (headerStyle === 'creative-rule' || headerStyle === 'ornament') {
                    return (
                        <View style={styles.headerCreative}>
                            {content}
                            {renderCreativeHeaderRule()}
                        </View>
                    );
                }
                if (headerStyle === 'minimal' || headerStyle === 'compact') {
                    return <View style={[styles.header, styles.headerThinRule]}>{content}</View>;
                }
                return <View style={styles.header}>{content}</View>;
            };

            if (headerLayout === 'split') {
                const inner = (
                    <>
                        <View style={styles.headerLeft}>
                            <Text style={styles.name}>{name}</Text>
                            {jobTitle && <Text style={styles.title}>{jobTitle}</Text>}
                        </View>
                        <View>{renderContactLines(true)}</View>
                    </>
                );
                if (headerStyle === 'accent-bar') {
                    return (
                        <View style={styles.headerAccentBar}>
                            <View style={styles.headerContent}>{inner}</View>
                        </View>
                    );
                }
                return wrapHeader(<View style={styles.headerContent}>{inner}</View>);
            }

            if (headerLayout === 'left') {
                return wrapHeader(
                    <>
                        <Text style={styles.name}>{name}</Text>
                        {jobTitle && <Text style={styles.title}>{jobTitle}</Text>}
                        <View>{renderContactLines(true)}</View>
                    </>
                );
            }

            return wrapHeader(
                <>
                    <Text style={styles.name}>{name}</Text>
                    {jobTitle && <Text style={styles.title}>{jobTitle}</Text>}
                    {renderContactLines(false)}
                </>
            );
        };

        const renderExperienceBlock = () => {
            if (!experience?.length) return null;
            return (
                <View style={styles.section}>
                    <SectionTitle
                        label={sectionTitles.experience || 'Experience'}
                        styles={styles}
                        theme={t}
                    />
                    {experience.map((exp, idx) => (
                        <View key={idx} style={styles.expItem}>
                            {expDatesBelow ? (
                                <View style={styles.expHeaderStacked}>
                                    <Text style={styles.expTitle}>{exp.title || 'Engineer'}</Text>
                                    <Text style={styles.expDatesBelow}>
                                        {exp.start_date} – {exp.end_date}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.expHeader}>
                                    <Text style={styles.expTitle}>{exp.title || 'Engineer'}</Text>
                                    <Text style={styles.expDates}>
                                        {exp.start_date} – {exp.end_date}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.expCompany}>
                                {exp.company}
                                {exp.location && `, ${exp.location}`}
                            </Text>
                            {exp.details?.length > 0 && (
                                <View style={styles.expDetails}>
                                    {exp.details.map((detail, detailIdx) => (
                                        <View key={detailIdx} style={{ marginBottom: 2 }}>
                                            <Text style={styles.expDetailItem}>
                                                {`${bullet}  ${String(detail ?? '')}`}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            );
        };

        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    {renderHeader()}

                    {summary && (
                        <View style={styles.section}>
                            <SectionTitle
                                label={sectionTitles.summary || 'Summary'}
                                styles={styles}
                                theme={t}
                            />
                            <Text style={styles.summary}>{summary}</Text>
                        </View>
                    )}

                    {skills && Object.keys(skills).length > 0 && (
                        <View style={styles.section}>
                            <SectionTitle
                                label={sectionTitles.skills || 'Skills'}
                                styles={styles}
                                theme={t}
                            />
                            {Object.entries(skills).map(([category, skillList], idx) => (
                                <View key={idx} style={styles.skillsCategory}>
                                    <Text style={styles.skillsLabel}>{category}</Text>
                                    <Text style={styles.skillsList}>
                                        {Array.isArray(skillList)
                                            ? skillList.join(' · ')
                                            : String(skillList)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {renderExperienceBlock()}

                    {education?.length > 0 && (
                        <View style={styles.section}>
                            <SectionTitle
                                label={sectionTitles.education || 'Education'}
                                styles={styles}
                                theme={t}
                            />
                            {education.map((edu, idx) => (
                                <View key={idx} style={styles.eduItem}>
                                    <View style={styles.eduHeader}>
                                        <Text style={styles.eduDegree}>{edu.degree}</Text>
                                        <Text style={styles.eduDates}>
                                            {extractYear(edu.start_year)}
                                            {edu.end_year && ` – ${extractYear(edu.end_year)}`}
                                        </Text>
                                    </View>
                                    <Text style={styles.eduSchool}>
                                        {edu.school}
                                        {edu.grade && ` • GPA: ${edu.grade}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Page>
            </Document>
        );
    };

    return TemplateComponent;
};
