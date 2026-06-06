import { Head } from '@inertiajs/react';

interface Props {
    success: boolean;
    reason?: string;
    scheduled_start?: string;
    patient_first_name?: string;
}

export default function ConfirmationResult({
    success,
    reason,
    scheduled_start,
    patient_first_name,
}: Props) {
    return (
        <>
            <Head title={success ? 'Rendez-vous confirmé' : 'Lien invalide'} />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-navy-50 to-background p-6 text-center">
                {success ? (
                    <>
                        <div className="mb-4 text-6xl">✓</div>
                        <h1 className="text-3xl font-semibold text-success">
                            {patient_first_name
                                ? `Merci ${patient_first_name} !`
                                : 'Merci !'}
                        </h1>
                        <p className="mt-2 max-w-md text-muted-foreground">
                            Votre rendez-vous est confirmé
                            {scheduled_start && ` pour le ${scheduled_start}`}.
                        </p>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            شكراً لتأكيد موعدكم — Thank you for confirming your
                            appointment.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mb-4 text-6xl text-danger">✕</div>
                        <h1 className="text-3xl font-semibold text-danger">
                            Lien invalide ou expiré
                        </h1>
                        <p className="mt-2 max-w-md text-muted-foreground">
                            Ce lien de confirmation n'est plus valide. Veuillez
                            contacter la clinique pour confirmer votre
                            rendez-vous.
                        </p>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            رابط منتهي الصلاحية — اتصل بالعيادة. This link is no
                            longer valid; please contact the clinic.
                        </p>
                        {reason && (
                            <p className="mt-4 font-mono text-xs text-muted-foreground">
                                code: {reason}
                            </p>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
