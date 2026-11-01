import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function ProfileHeader({
  name,
  oneLiner,
  photo,
  location,
}: {
  name: string;
  oneLiner: string;
  photo: string;
  location: string;
}) {
  const [photoSrc, setPhotoSrc] = useState(photo);

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
      className="flex flex-col items-center gap-3 text-center"
      data-testid="profile-header"
    >
      <motion.img
        variants={headerItem}
        src={photoSrc}
        onError={() => setPhotoSrc("/avatar.svg")}
        alt={name}
        data-testid="profile-photo"
        className="size-32 rounded-full object-cover shadow-card ring-4 ring-cast-saurav/30"
      />
      <motion.div variants={headerItem}>
        <h1 className="font-display text-3xl leading-tight text-cream" data-testid="profile-name">
          {name}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{oneLiner}</p>
      </motion.div>
      <motion.span
        variants={headerItem}
        className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted"
        data-testid="profile-location"
      >
        <MapPin className="size-3.5 text-sage" />
        {location}
      </motion.span>
    </motion.header>
  );
}
