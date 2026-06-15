import React from "react";
import { Facebook, Twitter, Linkedin, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialShareButtonsProps {
  title: string;
  author?: string;
  url: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function SocialShareButtons({
  title,
  author,
  url,
  description,
  size = "md",
  showLabel = true,
}: SocialShareButtonsProps) {
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const text = author ? `${title} par ${author}` : title;
  const fullDescription = description || `Découvrez "${title}" sur Cavally Livres - Manuels et Oeuvres Littéraires`;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}&hashtags=CavaliLivres,Livres,Manuels`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${fullDescription}\n${fullUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
  };

  const handleShare = (platform: string, link: string) => {
    window.open(link, "_blank", "width=600,height=400");
  };

  return (
    <div className="flex items-center gap-2 flex-nowrap">
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 mr-1 whitespace-nowrap">Partager:</span>
      )}

      {/* Facebook */}
      <Button
        variant="outline"
        size="icon"
        className={`${sizeClasses[size]} border-[#005f8a] text-[#005f8a] hover:bg-[#f0f7fb] hover:text-[#004a6a] social-share-btn social-share-btn-facebook`}
        onClick={() => handleShare("facebook", shareLinks.facebook)}
        title="Partager sur Facebook"
      >
        <Facebook className={iconSizes[size]} />
      </Button>

      {/* Twitter */}
      <Button
        variant="outline"
        size="icon"
        className={`${sizeClasses[size]} border-sky-500 text-sky-500 hover:bg-sky-50 hover:text-sky-600 social-share-btn social-share-btn-twitter`}
        onClick={() => handleShare("twitter", shareLinks.twitter)}
        title="Partager sur Twitter"
      >
        <Twitter className={iconSizes[size]} />
      </Button>

      {/* WhatsApp */}
      <Button
        variant="outline"
        size="icon"
        className={`${sizeClasses[size]} border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 social-share-btn social-share-btn-whatsapp`}
        onClick={() => handleShare("whatsapp", shareLinks.whatsapp)}
        title="Partager sur WhatsApp"
      >
        <MessageCircle className={iconSizes[size]} />
      </Button>

      {/* LinkedIn */}
      <Button
        variant="outline"
        size="icon"
        className={`${sizeClasses[size]} border-blue-700 text-[#004a6a] hover:bg-[#f0f7fb] hover:text-blue-800 social-share-btn social-share-btn-linkedin`}
        onClick={() => handleShare("linkedin", shareLinks.linkedin)}
        title="Partager sur LinkedIn"
      >
        <Linkedin className={iconSizes[size]} />
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="icon"
        className={`${sizeClasses[size]} border-gray-400 text-gray-600 hover:bg-gray-50 hover:text-gray-700 social-share-btn social-share-btn-copy`}
        onClick={() => {
          navigator.clipboard.writeText(fullUrl);
          alert("Lien copié dans le presse-papiers!");
        }}
        title="Copier le lien"
      >
        <Share2 className={iconSizes[size]} />
      </Button>
    </div>
  );
}
