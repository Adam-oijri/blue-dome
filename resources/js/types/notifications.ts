/** One item in the unified dashboard notification feed (alert or activity). */
export type NotificationItem = {
    id: string;
    notification_id: string | null;
    kind: 'alert' | 'activity';
    type: string;
    title: string;
    message: string | null;
    href: string | null;
    at: string | null;
    read: boolean;
    important: boolean;
};
