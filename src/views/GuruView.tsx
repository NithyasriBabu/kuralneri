import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Plus, Sparkles, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KuralButton } from 'src/components/common/KuralButton';
import { KuralIconButton } from 'src/components/common/KuralIconButton';
import { KuralInput } from 'src/components/common/KuralInput';
import { KuralText } from 'src/components/common/KuralText';
import { useTranslation } from 'src/content/translation';
import { useGuruController } from 'src/hooks/useGuruController';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { GuruThreadMessage } from 'src/types/guru';

interface GuruViewProps {
  onKuralPress?: (kuralId: number) => void;
}

function renderMessageBody(message: GuruThreadMessage) {
  return message.content
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function GuruView({ onKuralPress }: GuruViewProps) {
  const { componentStyles, theme } = useTheme();
  const { t, pair } = useTranslation('uiChrome', 'guru');
  const { t: tCommon } = useTranslation('uiChrome', 'common');
  const {
    activeSession,
    activeSessionId,
    activeSessionSummary,
    contextLimitReached,
    deleteSession,
    draft,
    error,
    loading,
    messages,
    selectSession,
    sending,
    sessions,
    setDraft,
    sendMessage,
    startNewSession,
    summarizeCurrentSession,
    summaryLoading,
  } = useGuruController();

  const scrollRef = useRef<ScrollView>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length, activeSessionId]);

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const isWide = theme.layout.isWideScreen;

  const sessionList =
    sessions.length > 0 ? (
      <ScrollView
        style={componentStyles.guruSessionListScroll}
        contentContainerStyle={componentStyles.guruSessionListContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {sessions.map((session) => {
          const active = session.session_id === activeSessionId;
          const preview = session.last_message_preview || session.summary_text || t('emptyBody');

          return (
            <Pressable
              key={session.session_id}
              onPress={() => void selectSession(session.session_id)}
              style={[
                componentStyles.guruSessionButton,
                active && componentStyles.guruSessionButtonActive,
              ]}
            >
              <KuralText
                variant="bodyNormal"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={componentStyles.guruSessionTitle}
              >
                {session.title}
              </KuralText>
              <KuralText
                variant="caption"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={componentStyles.guruSessionMeta}
              >
                {preview}
              </KuralText>
            </Pressable>
          );
        })}
      </ScrollView>
    ) : (
      <View style={componentStyles.guruEmptyState}>
        <KuralText variant="h2" style={componentStyles.guruEmptyTitle}>
          {t('noSessionsTitle')}
        </KuralText>
        <KuralText variant="bodyNormal" style={componentStyles.guruEmptyBody}>
          {t('noSessionsBody')}
        </KuralText>
      </View>
    );

  return (
    <SafeAreaView style={componentStyles.guruScreen} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[componentStyles.guruShell, !isWide && { flexDirection: 'column' }]}>
        <View style={[componentStyles.guruSidebar, !isWide && componentStyles.guruSidebarMobile]}>
          <View style={componentStyles.guruSidebarHeader}>
            <KuralText variant="bodyNormal" style={componentStyles.guruSidebarTitle}>
              {t('sessionsHeader')}
            </KuralText>
            <KuralIconButton
              icon={<Plus />}
              label={pair('newSession').visible}
              tooltip={pair('newSession').hover}
              onPress={() => void startNewSession()}
            />
          </View>
          {sessionList}
        </View>

        <View style={componentStyles.guruMainColumn}>
          <View style={componentStyles.guruMainHeader}>
            <View style={componentStyles.guruMainHeaderRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <KuralText variant="h2" style={componentStyles.guruMainTitle}>
                  {activeSession?.title ?? t('emptyTitle')}
                </KuralText>
                <KuralText variant="caption" style={componentStyles.guruMainSubtitle}>
                  {activeSession
                    ? `${activeSession.message_count} / ${activeSession.context_limit} messages`
                    : t('body')}
                </KuralText>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <KuralButton
                  title={t('summaryAction')}
                  variant="secondary"
                  onPress={() => void summarizeCurrentSession()}
                  loading={summaryLoading}
                  disabled={!activeSessionId || summaryLoading}
                />
                <KuralIconButton
                  icon={<Trash2 />}
                  label={pair('deleteAction').visible}
                  tooltip={pair('deleteAction').hover}
                  onPress={handleDelete}
                  disabled={!activeSessionId}
                />
              </View>
            </View>

            {deleteConfirmOpen ? (
              <View style={componentStyles.guruSummaryCard}>
                <KuralText variant="caption" style={componentStyles.guruSummaryTitle}>
                  {t('deletePromptTitle')}
                </KuralText>
                <KuralText variant="bodyNormal" style={componentStyles.guruSummaryBody}>
                  {t('deletePromptBody')}
                </KuralText>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <KuralButton
                    title={tCommon('cancel')}
                    variant="secondary"
                    onPress={() => setDeleteConfirmOpen(false)}
                  />
                  <KuralIconButton
                    icon={<Trash2 />}
                    label={pair('deleteAction').visible}
                    tooltip={pair('deleteAction').hover}
                    onPress={() => {
                      setDeleteConfirmOpen(false);
                      if (activeSessionId) void deleteSession(activeSessionId);
                    }}
                  />
                </View>
              </View>
            ) : null}

            {activeSessionSummary ? (
              <View style={componentStyles.guruSummaryCard}>
                <KuralText variant="caption" style={componentStyles.guruSummaryTitle}>
                  {t('summaryLabel')}
                </KuralText>
                <KuralText variant="bodyNormal" style={componentStyles.guruSummaryBody}>
                  {activeSessionSummary}
                </KuralText>
              </View>
            ) : null}

            {contextLimitReached ? (
              <View style={componentStyles.guruLimitBanner}>
                <KuralText variant="caption" style={componentStyles.guruLimitBannerText}>
                  {t('limitTitle')}
                </KuralText>
                <KuralText variant="caption" style={componentStyles.guruLimitBannerText}>
                  {t('limitBody')}
                </KuralText>
              </View>
            ) : null}
          </View>

          <ScrollView
            ref={scrollRef}
            style={componentStyles.guruThreadList}
            contentContainerStyle={componentStyles.guruThreadContent}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View style={componentStyles.guruEmptyState}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <KuralText variant="bodyNormal" style={componentStyles.guruEmptyBody}>
                  {t('loading')}
                </KuralText>
              </View>
            ) : messages.length === 0 ? (
              <View style={componentStyles.guruEmptyState}>
                <KuralText variant="h2" style={componentStyles.guruEmptyTitle}>
                  {t('emptyTitle')}
                </KuralText>
                <KuralText variant="bodyNormal" style={componentStyles.guruEmptyBody}>
                  {t('emptyBody')}
                </KuralText>
              </View>
            ) : (
              messages.map((message) => {
                const isGuru = message.role === 'guru';
                return (
                  <View
                    key={message.id}
                    style={[
                      componentStyles.guruMessageBubble,
                      isGuru
                        ? componentStyles.guruMessageBubbleGuru
                        : componentStyles.guruMessageBubbleUser,
                    ]}
                  >
                    <View style={componentStyles.guruMessageMetaRow}>
                      <KuralText variant="caption" style={componentStyles.guruMessageRole}>
                        {isGuru ? t('guruLabel') : t('userLabel')}
                      </KuralText>
                      <KuralText variant="caption" style={componentStyles.guruSessionMeta}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </KuralText>
                    </View>
                    {renderMessageBody(message).map((paragraph, index) => (
                      <KuralText
                        key={`${message.id}-${index}`}
                        variant="bodyNormal"
                        style={componentStyles.guruMessageContent}
                      >
                        {paragraph}
                      </KuralText>
                    ))}
                    {isGuru && message.citations.length > 0 ? (
                      <View style={componentStyles.guruCitationList}>
                        <KuralText variant="caption" style={componentStyles.guruMessageRole}>
                          {t('citationsLabel')}
                        </KuralText>
                        {message.citations.map((citation) => (
                          <Pressable
                            key={`${message.id}-${citation.kural_id}`}
                            style={componentStyles.guruCitationButton}
                            onPress={() => onKuralPress?.(citation.kural_id)}
                          >
                            <KuralText
                              variant="caption"
                              style={componentStyles.guruCitationButtonText}
                            >
                              {`${citation.citation_order}. Kural ${citation.kural_id}`}
                            </KuralText>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={componentStyles.guruComposer}>
            <KuralInput
              value={draft}
              onChangeText={setDraft}
              placeholder={contextLimitReached ? t('limitBody') : t('composerPlaceholder')}
              multiline
              editable={!contextLimitReached}
              containerStyle={componentStyles.guruComposerInput}
            />
            <View style={componentStyles.guruComposerActionsRow}>
              <KuralText variant="caption" style={componentStyles.guruComposerHint}>
                {contextLimitReached ? t('limitBody') : t('body')}
              </KuralText>
              <KuralButton
                title={t('send')}
                onPress={() => void sendMessage()}
                disabled={!draft.trim() || contextLimitReached || sending}
                loading={sending}
              />
            </View>
          </View>
        </View>
      </View>
      {error ? (
        <View style={{ paddingHorizontal: theme.layout.screenPadding, paddingBottom: 8 }}>
          <KuralText variant="caption" style={{ color: theme.colors.error }}>
            {error}
          </KuralText>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
