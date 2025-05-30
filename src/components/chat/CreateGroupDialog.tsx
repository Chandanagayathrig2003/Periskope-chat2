
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, Users, Plus } from 'lucide-react';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: { name: string; description: string; members: string[] }) => void;
}

// Sample users for group creation
const sampleUsers = [
  { id: 'user-1', name: 'John Doe', phone: '+1234567890', avatar: null },
  { id: 'user-2', name: 'Sarah Wilson', phone: '+1234567891', avatar: null },
  { id: 'user-3', name: 'Mike Johnson', phone: '+1234567892', avatar: null },
  { id: 'user-4', name: 'Emma Davis', phone: '+1234567893', avatar: null },
  { id: 'user-5', name: 'Alex Brown', phone: '+1234567894', avatar: null },
];

export function CreateGroupDialog({ isOpen, onClose, onCreateGroup }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = sampleUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;

    onCreateGroup({
      name: groupName,
      description: groupDescription,
      members: selectedMembers
    });

    // Reset form
    setGroupName('');
    setGroupDescription('');
    setSelectedMembers([]);
    setSearchTerm('');
  };

  const handleClose = () => {
    setGroupName('');
    setGroupDescription('');
    setSelectedMembers([]);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span>Create New Group</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (optional)</Label>
            <Textarea
              id="groupDescription"
              placeholder="Enter group description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Members ({selectedMembers.length})</Label>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {selectedMembers.map(memberId => {
                  const user = sampleUsers.find(u => u.id === memberId);
                  if (!user) return null;
                  return (
                    <Badge
                      key={memberId}
                      variant="secondary"
                      className="flex items-center space-x-1 bg-green-50 text-green-700 border border-green-200"
                    >
                      <span className="text-xs">{user.name}</span>
                      <button
                        onClick={() => handleMemberToggle(memberId)}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Member Search */}
          <div className="space-y-2">
            <Label htmlFor="memberSearch">Add Members</Label>
            <Input
              id="memberSearch"
              placeholder="Search users by name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User List */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => handleMemberToggle(user.id)}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedMembers.includes(user.id) ? 'bg-green-50 border border-green-200' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.phone}</p>
                </div>
                {selectedMembers.includes(user.id) && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No users found</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
