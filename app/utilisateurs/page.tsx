"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Button, Table, TableRow, TableCell, Badge, Select, ConfirmModal } from "@/components/ui";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllUsers, updateUserRole, toggleUserStatus, deleteUser } from "@/lib/firebase/users";
import { updateUserPassword } from "@/lib/firebase/admin-actions";
import { User, UserRole } from "@/lib/lots/types";
import { useToast } from "@/components/ui";
import { Plus, Edit, Trash2, Power, Key, Eye, EyeOff } from "lucide-react";

export default function UtilisateursPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{ user: User; action: string } | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("imrep");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("imrep");
  const [newUserDisplayName, setNewUserDisplayName] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [showNewUserConfirmPassword, setShowNewUserConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "allianz") {
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        showToast("Erreur lors du chargement des utilisateurs", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, role, authLoading, roleLoading, router, showToast]);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await updateUserRole(selectedUser.user.id, newRole);
      showToast("Rôle mis à jour avec succès", "success");
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      setSelectedUser(null);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la mise à jour", "error");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      showToast(`Utilisateur ${!currentStatus ? "activé" : "désactivé"}`, "success");
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la modification", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.user.id);
      showToast("Utilisateur supprimé", "success");
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      setSelectedUser(null);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la suppression", "error");
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser) return;

    // Validation
    setPasswordError("");
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await updateUserPassword(selectedUser.user.id, newPassword, selectedUser.user.email);
      showToast("Mot de passe modifié avec succès", "success");
      setSelectedUser(null);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la modification du mot de passe", "error");
      setPasswordError(error.message || "Erreur lors de la modification");
    }
  };

  const handleCreateUser = async () => {
    // Validation
    setCreateUserError("");
    
    if (!newUserEmail || !newUserEmail.includes("@")) {
      setCreateUserError("Email invalide");
      return;
    }

    if (!newUserPassword || newUserPassword.length < 6) {
      setCreateUserError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newUserPassword !== newUserConfirmPassword) {
      setCreateUserError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!user) {
      setCreateUserError("Vous devez être connecté");
      return;
    }

    setIsCreating(true);
    try {
      // Récupérer le token Firebase
      const idToken = await user.getIdToken();

      // Appeler l'API route
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          displayName: newUserDisplayName || undefined,
          idToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la création de l'utilisateur");
      }

      showToast("Utilisateur créé avec succès", "success");
      setShowCreateModal(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserConfirmPassword("");
      setNewUserDisplayName("");
      setNewUserRole("imrep");
      setCreateUserError("");
      setShowNewUserPassword(false);
      setShowNewUserConfirmPassword(false);
      
      // Rafraîchir la liste des utilisateurs
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la création de l'utilisateur", "error");
      setCreateUserError(error.message || "Erreur lors de la création");
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-base text-[var(--color-neutral-600)]">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isRootAdmin = (userEmail: string) => userEmail === "jeanmichel@allianz-nogaro.fr";

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-[24px]">
        <SectionTitle>Gestion des utilisateurs</SectionTitle>
        <Button variant="primary" onClick={() => {
          setShowCreateModal(true);
          setNewUserEmail("");
          setNewUserPassword("");
          setNewUserConfirmPassword("");
          setNewUserDisplayName("");
          setNewUserRole("imrep");
          setCreateUserError("");
          setShowNewUserPassword(false);
          setShowNewUserConfirmPassword(false);
        }}>
          <Plus size={18} className="mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      <Table headers={["Email", "Rôle", "Statut", "Actions"]}>
        {users.map((u) => {
          const isProtected = isRootAdmin(u.email);
          return (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.email}</TableCell>
              <TableCell>
                <Badge type={u.role === "allianz" ? "info" : "success"}>
                  {u.role === "allianz" ? "Allianz" : "IMREP"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge type={u.isActive ? "success" : "warning"}>
                  {u.isActive ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {!isProtected && (
                    <>
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => {
                          setSelectedUser({ user: u, action: "role" });
                          setNewRole(u.role);
                        }}
                        title="Modifier le rôle"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => {
                          setSelectedUser({ user: u, action: "password" });
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError("");
                          setShowPassword(false);
                          setShowConfirmPassword(false);
                        }}
                        title="Modifier le mot de passe"
                      >
                        <Key size={16} />
                      </Button>
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        title={u.isActive ? "Désactiver" : "Activer"}
                      >
                        <Power size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        className="p-2"
                        onClick={() => setSelectedUser({ user: u, action: "delete" })}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                  {isProtected && (
                    <>
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => {
                          setSelectedUser({ user: u, action: "password" });
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError("");
                          setShowPassword(false);
                          setShowConfirmPassword(false);
                        }}
                        title="Modifier le mot de passe"
                      >
                        <Key size={16} />
                      </Button>
                      <span className="text-sm text-[var(--color-neutral-500)]">Protégé</span>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </Table>

      {selectedUser?.action === "role" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[var(--radius-md)] p-[var(--spacing-md)] max-w-md w-full mx-4 shadow-[var(--shadow-hover)]">
            <h3 className="text-[20px] font-semibold text-[var(--color-dark)] mb-4">
              Modifier le rôle
            </h3>
            <Select
              label="Nouveau rôle"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="mb-4"
            >
              <option value="imrep">IMREP</option>
              <option value="allianz">Allianz</option>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleUpdateRole}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedUser?.action === "password" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[var(--radius-md)] p-[var(--spacing-md)] max-w-md w-full mx-4 shadow-[var(--shadow-hover)]">
            <h3 className="text-[20px] font-semibold text-[var(--color-dark)] mb-4">
              Modifier le mot de passe
            </h3>
            <p className="text-sm text-[var(--color-neutral-600)] mb-4">
              Utilisateur : <strong>{selectedUser.user.email}</strong>
            </p>
            <div className="relative mb-4">
              <Input
                type={showPassword ? "text" : "password"}
                label="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                className="pr-10"
                helpText="Minimum 6 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[#64748b] hover:text-[#475569] transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative mb-4">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                className="pr-10"
                error={passwordError}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-[#64748b] hover:text-[#475569] transition-colors"
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => {
                setSelectedUser(null);
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleUpdatePassword}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedUser?.action === "delete" && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          onConfirm={handleDelete}
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser.user.email} ?`}
          variant="danger"
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[var(--radius-md)] p-[var(--spacing-md)] max-w-md w-full mx-4 shadow-[var(--shadow-hover)]">
            <h3 className="text-[20px] font-semibold text-[var(--color-dark)] mb-4">
              Créer un nouvel utilisateur
            </h3>
            <Input
              type="email"
              label="Email"
              value={newUserEmail}
              onChange={(e) => {
                setNewUserEmail(e.target.value);
                setCreateUserError("");
              }}
              className="mb-4"
              placeholder="utilisateur@example.com"
              required
            />
            <Input
              type="text"
              label="Nom d'affichage (optionnel)"
              value={newUserDisplayName}
              onChange={(e) => {
                setNewUserDisplayName(e.target.value);
                setCreateUserError("");
              }}
              className="mb-4"
              placeholder="Nom de l'utilisateur"
            />
            <Select
              label="Rôle"
              value={newUserRole}
              onChange={(e) => {
                setNewUserRole(e.target.value as UserRole);
                setCreateUserError("");
              }}
              className="mb-4"
            >
              <option value="imrep">IMREP</option>
              <option value="allianz">Allianz</option>
            </Select>
            <div className="relative mb-4">
              <Input
                type={showNewUserPassword ? "text" : "password"}
                label="Mot de passe"
                value={newUserPassword}
                onChange={(e) => {
                  setNewUserPassword(e.target.value);
                  setCreateUserError("");
                }}
                className="pr-10"
                helpText="Minimum 6 caractères"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                className="absolute right-3 top-9 text-[#64748b] hover:text-[#475569] transition-colors"
                aria-label={showNewUserPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showNewUserPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative mb-4">
              <Input
                type={showNewUserConfirmPassword ? "text" : "password"}
                label="Confirmer le mot de passe"
                value={newUserConfirmPassword}
                onChange={(e) => {
                  setNewUserConfirmPassword(e.target.value);
                  setCreateUserError("");
                }}
                className="pr-10"
                error={createUserError}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewUserConfirmPassword(!showNewUserConfirmPassword)}
                className="absolute right-3 top-9 text-[#64748b] hover:text-[#475569] transition-colors"
                aria-label={showNewUserConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showNewUserConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUserEmail("");
                  setNewUserPassword("");
                  setNewUserConfirmPassword("");
                  setNewUserDisplayName("");
                  setNewUserRole("imrep");
                  setCreateUserError("");
                  setShowNewUserPassword(false);
                  setShowNewUserConfirmPassword(false);
                }}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleCreateUser} isLoading={isCreating}>
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

