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
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6 text-center">
                {success ? (
                    <>
                        <div className="mb-4 text-6xl">✓</div>
                        <h1 className="text-3xl font-semibold text-emerald-700">
                            {patient_first_name
                                ? `Merci ${patient_first_name} !`
                                : 'Merci !'}
                        </h1>
                        <p className="mt-2 max-w-md text-neutral-600">
                            Votre rendez-vous est confirmé
                            {scheduled_start && ` pour le ${scheduled_start}`}.
                        </p>
                        <p className="mt-1 max-w-md text-sm text-neutral-500">
                            شكراً لتأكيد موعدكم — Thank you for confirming your
                            appointment.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mb-4 text-6xl text-rose-600">✕</div>
                        <h1 className="text-3xl font-semibold text-rose-700">
                            Lien invalide ou expiré
                        </h1>
                        <p className="mt-2 max-w-md text-neutral-600">
                            Ce lien de confirmation n'est plus valide. Veuillez
                            contacter la clinique pour confirmer votre
                            rendez-vous.
                        </p>
                        <p className="mt-1 max-w-md text-sm text-neutral-500">
                            رابط منتهي الصلاحية — اتصل بالعيادة. This link is no
                            longer valid; please contact the clinic.
                        </p>
                        {reason && (
                            <p className="mt-4 font-mono text-xs text-neutral-400">
                                code: {reason}
                            </p>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
