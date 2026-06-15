import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditManualModalProps {
  manual: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditManualModal({ manual, onClose, onSuccess }: EditManualModalProps) {
  const [formData, setFormData] = useState({
    id: manual.id,
    title: manual.title,
    author: manual.author,
    isbn: manual.isbn || '',
    description: manual.description || '',
    price: manual.price,
    stock: manual.stock,
    educationLevelId: manual.educationLevelId?.toString() || '',
    educationClassId: manual.educationClassId?.toString() || '',
    coverImageUrl: manual.coverImageUrl || '',
  });

  const [educationLevels, setEducationLevels] = useState<any[]>([]);
  const [educationClasses, setEducationClasses] = useState<any[]>([]);

  // Fetch education levels
  const { data: levels } = trpc.manuals.getLevels.useQuery();

  // Fetch classes when level changes
  const { data: classes } = trpc.manuals.getClassesByLevel.useQuery(
    { levelId: parseInt(formData.educationLevelId) },
    { enabled: !!formData.educationLevelId }
  );

  const updateManualMutation = trpc.manuals.updateManual.useMutation();

  useEffect(() => {
    if (levels) {
      setEducationLevels(levels);
    }
  }, [levels]);

  useEffect(() => {
    if (classes) {
      setEducationClasses(classes);
    }
  }, [classes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateManualMutation.mutateAsync({
        id: formData.id,
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || undefined,
        description: formData.description || undefined,
        price: formData.price,
        stock: formData.stock,
        educationLevelId: formData.educationLevelId ? parseInt(formData.educationLevelId) : undefined,
        educationClassId: formData.educationClassId ? parseInt(formData.educationClassId) : undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
      });

      toast.success('Manuel mis à jour avec succès!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du manuel');
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le Manuel</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du manuel scolaire
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre du Manuel *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Auteur *</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* ISBN */}
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Prix (FCFA) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              required
            />
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Education Level */}
          <div className="space-y-2">
            <Label htmlFor="educationLevelId">Niveau d'Éducation</Label>
            <Select
              value={formData.educationLevelId}
              onValueChange={(value) => handleSelectChange('educationLevelId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                {educationLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Education Class */}
          {formData.educationLevelId && (
            <div className="space-y-2">
              <Label htmlFor="educationClassId">Classe d'Éducation</Label>
              <Select
                value={formData.educationClassId}
                onValueChange={(value) => handleSelectChange('educationClassId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {educationClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cover Image URL */}
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">URL de la Couverture</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateManualMutation.isPending}
              className="flex items-center gap-2"
            >
              {updateManualMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Mettre à jour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
