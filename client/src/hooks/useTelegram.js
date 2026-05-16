// Хук для работы с Telegram Web App API
import { useCallback, useEffect, useMemo } from 'react';

/**
 * Хук useTelegram — предоставляет доступ к Telegram Web App API.
 * Автоматически вызывает tg.ready() и tg.expand() при монтировании.
 */
export function useTelegram() {
  const tg = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  // Получить initData для передачи на сервер
  const initData = useMemo(() => tg?.initData || '', [tg]);

  // Данные пользователя из Telegram
  const user = useMemo(() => tg?.initDataUnsafe?.user || null, [tg]);

  // Закрыть Mini App
  const close = useCallback(() => tg?.close(), [tg]);

  // Показать/скрыть кнопку "Назад"
  const showBackButton = useCallback(() => {
    tg?.BackButton?.show();
  }, [tg]);

  const hideBackButton = useCallback(() => {
    tg?.BackButton?.hide();
  }, [tg]);

  // Обработчик кнопки "Назад"
  const onBackButtonClick = useCallback((callback) => {
    tg?.BackButton?.onClick(callback);
    return () => tg?.BackButton?.offClick(callback);
  }, [tg]);

  // Показать MainButton (внизу экрана)
  const showMainButton = useCallback((text, callback) => {
    if (!tg?.MainButton) return;
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(callback);
    return () => {
      tg.MainButton.offClick(callback);
      tg.MainButton.hide();
    };
  }, [tg]);

  // Haptic feedback
  const haptic = useMemo(() => ({
    impact: (style = 'medium') => tg?.HapticFeedback?.impactOccurred(style),
    notification: (type = 'success') => tg?.HapticFeedback?.notificationOccurred(type),
    selection: () => tg?.HapticFeedback?.selectionChanged(),
  }), [tg]);

  // Тема Telegram
  const themeParams = useMemo(() => tg?.themeParams || {}, [tg]);
  const colorScheme = useMemo(() => tg?.colorScheme || 'light', [tg]);

  return {
    tg,
    initData,
    user,
    close,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
    showMainButton,
    haptic,
    themeParams,
    colorScheme,
  };
}
