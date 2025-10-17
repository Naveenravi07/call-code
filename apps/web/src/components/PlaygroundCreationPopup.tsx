import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { playgroundList } from '@repo/shared/playgrounds/constants';
import instance from '@/axios/axios.config';
import { useNavigate } from '@tanstack/react-router';
import { playGroundCreationResponseSchema } from '@repo/shared';

interface PlayGroundCreationPopUpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayGroundCreationPopUp({ isOpen, onClose }: PlayGroundCreationPopUpProps) {
  const navigate = useNavigate({ from: '/' });
  const [selectedMeetingType, setSelectedMeetingType] = useState<string | null>(null);

  const handleMeetingTypeSelect = (typeId: string) => {
    setSelectedMeetingType(typeId);
  };

  const handleSubmit = () => {
    if (selectedMeetingType) {
      console.log('Creating meeting:', { type: selectedMeetingType });

      void instance
        .post('/playgrounds/create', {
          playground: selectedMeetingType,
        })
        .then(resp => {
          const response = playGroundCreationResponseSchema.parse(resp.data);
          navigate({
            to: '/playground',
            search: {
              session_name: response.session_name,
            },
          });
          setSelectedMeetingType(null);
          onClose();
        })
        .catch(err => {
          console.error(err);
          setSelectedMeetingType(null);
          onClose();
        });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedMeetingType(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Meeting</DialogTitle>
          <DialogDescription>
            Choose a meeting type to get started. Each type is optimized for different use cases and
            comes with pre-configured settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {playgroundList.map(type => {
            const IconComponent = type.icon;
            const isSelected = selectedMeetingType === type.id;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer hover:shadow-md transition-all border-2 ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/20'}`}
                onClick={() => handleMeetingTypeSelect(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${type.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{type.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedMeetingType && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-4">
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMeetingType(null);
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => void handleSubmit()}>Create Meeting</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
