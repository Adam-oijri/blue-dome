import { motion } from 'framer-motion';

interface FooterColumnProps {
    heading: string;
    items: { label: string; href: string }[];
}

export function FooterColumn({ heading, items }: FooterColumnProps) {
    return (
        <div>
            <h4 className="text-[12px] font-semibold tracking-wider text-navy-900 uppercase">
                {heading}
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13px]">
                {items.map((it) => (
                    <li key={it.label}>
                        <motion.a
                            href={it.href}
                            whileHover={{ x: 2 }}
                            transition={{
                                type: 'spring',
                                stiffness: 320,
                                damping: 22,
                            }}
                            className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {it.label}
                        </motion.a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
