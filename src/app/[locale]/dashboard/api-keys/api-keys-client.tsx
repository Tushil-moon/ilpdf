"use client";

import { useState } from "react";
import { Key, Plus, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string | null;
  createdAt: string;
}

interface ApiKeysClientProps {
  initialKeys: ApiKeyRecord[];
}

export function ApiKeysClient({ initialKeys }: ApiKeysClientProps) {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(initialKeys);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const refreshKeys = async () => {
    const res = await fetch("/api/v1/api-keys", { credentials: "same-origin" });
    if (!res.ok) return;
    const json = await res.json();
    setKeys(json.data?.keys ?? []);
  };

  const createKey = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Failed to create key");
      setNewKey(json.data.key);
      setName("");
      await refreshKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async (id: string) => {
    await fetch(`/api/v1/api-keys/${id}`, { method: "DELETE", credentials: "same-origin" });
    await refreshKeys();
  };

  const copyKey = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create API Key
          </CardTitle>
          <CardDescription>
            Keys are shown once. Use{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">Authorization: Bearer ilp_live_...</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key name</Label>
            <Input
              id="keyName"
              placeholder="Production server"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={createKey} disabled={loading || !name.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Key"}
          </Button>

          {newKey && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Copy your API key now — it won&apos;t be shown again.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs">{newKey}</code>
                <Button variant="outline" size="icon" onClick={copyKey} aria-label="Copy key">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <ul className="space-y-3">
              {keys.map((key) => (
                <li
                  key={key.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/50 p-4"
                >
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {key.prefix}•••• • Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => revokeKey(key.id)} aria-label="Revoke key">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 rounded-xl border border-border/50 bg-muted/30 p-4 text-sm space-y-2">
        <p className="font-medium">API Documentation</p>
        <p className="text-muted-foreground">
          Base URL: <code>/api/v1</code> — See{" "}
          <a href="/api/v1" className="text-red-500 hover:underline" target="_blank" rel="noopener noreferrer">
            /api/v1
          </a>{" "}
          for full endpoint list.
        </p>
      </div>
    </>
  );
}
