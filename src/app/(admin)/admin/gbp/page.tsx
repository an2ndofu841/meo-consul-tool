"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Store,
  MapPin,
} from "lucide-react";
import {
  getConnectionStatus,
  fetchGbpAccounts,
  fetchGbpLocations,
  linkGbpLocation,
  syncReviews,
  syncPerformance,
} from "@/lib/google/sync";
import type { GbpAccount, GbpLocation } from "@/lib/google/gbp-client";

const ORG_ID = "11111111-1111-1111-1111-111111111111";

export default function GbpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <GbpPageContent />
    </Suspense>
  );
}

function GbpPageContent() {
  const searchParams = useSearchParams();
  const [connectionStatus, setConnectionStatus] = useState<{
    google_email: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<GbpAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [gbpLocations, setGbpLocations] = useState<GbpLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const status = await getConnectionStatus(ORG_ID);
      setConnectionStatus(status);
    } catch {
      setConnectionStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "connected") {
      setMessage({ type: "success", text: "Googleアカウントの接続に成功しました" });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        google_not_configured: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が環境変数に設定されていません。Vercelの設定 → Environment Variables で追加してください",
        user_lookup_failed: "ユーザー情報の取得に失敗しました",
        permission_denied: "この操作にはadminまたはoperator権限が必要です",
        connect_failed: "Google接続処理でエラーが発生しました",
        missing_code: "認証コードが取得できませんでした",
        no_refresh_token: "リフレッシュトークンが取得できませんでした。再度接続してください",
        db_error: "トークンの保存に失敗しました",
        callback_failed: "コールバック処理に失敗しました",
        access_denied: "アクセスが拒否されました",
      };
      setMessage({ type: "error", text: errorMessages[error] || `エラー: ${error}` });
    }
  }, [searchParams, checkConnection]);

  const handleLoadAccounts = async () => {
    try {
      setLoading(true);
      const accts = await fetchGbpAccounts(ORG_ID);
      setAccounts(accts);
      if (accts.length > 0) {
        setSelectedAccount(accts[0].name);
      }
    } catch (err) {
      setMessage({ type: "error", text: `アカウント取得エラー: ${err instanceof Error ? err.message : "不明"}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadLocations = async () => {
    if (!selectedAccount) return;
    try {
      setLoadingLocations(true);
      const locs = await fetchGbpLocations(ORG_ID, selectedAccount);
      setGbpLocations(locs);
    } catch (err) {
      setMessage({ type: "error", text: `ロケーション取得エラー: ${err instanceof Error ? err.message : "不明"}` });
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Googleアカウントの接続を解除しますか？")) return;
    try {
      const res = await fetch("/api/google/disconnect", { method: "POST" });
      if (res.ok) {
        setConnectionStatus(null);
        setAccounts([]);
        setGbpLocations([]);
        setMessage({ type: "success", text: "接続を解除しました" });
      }
    } catch {
      setMessage({ type: "error", text: "接続解除に失敗しました" });
    }
  };

  const handleSyncReviews = async (locationId: string) => {
    try {
      setSyncing(`reviews-${locationId}`);
      const result = await syncReviews(ORG_ID, locationId);
      setMessage({ type: "success", text: `口コミ ${result.syncedCount} 件を同期しました` });
    } catch (err) {
      setMessage({ type: "error", text: `同期エラー: ${err instanceof Error ? err.message : "不明"}` });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncPerformance = async (locationId: string) => {
    try {
      setSyncing(`perf-${locationId}`);
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      const metrics = await syncPerformance(ORG_ID, locationId, startDate, endDate);
      setMessage({
        type: "success",
        text: `パフォーマンス取得完了 — 検索表示: ${metrics.searchViews}, マップ表示: ${metrics.mapViews}, 通話: ${metrics.phoneCallClicks}`,
      });
    } catch (err) {
      setMessage({ type: "error", text: `同期エラー: ${err instanceof Error ? err.message : "不明"}` });
    } finally {
      setSyncing(null);
    }
  };

  const formatAddress = (loc: GbpLocation) => {
    const addr = loc.storefrontAddress;
    if (!addr) return "住所なし";
    return [
      ...(addr.addressLines || []),
      addr.locality,
      addr.administrativeArea,
    ]
      .filter(Boolean)
      .join(" ");
  };

  if (loading && !connectionStatus) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">GBP連携管理</h1>
        <p className="text-muted-foreground mt-1">
          Google Business Profile と連携して、実データを取得します
        </p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
          <button
            className="ml-auto text-sm underline"
            onClick={() => setMessage(null)}
          >
            閉じる
          </button>
        </div>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Googleアカウント接続</CardTitle>
          <CardDescription>
            GBPのデータを取得するために、Googleアカウントを接続してください。
            Google Cloud ConsoleでOAuth同意画面とクレデンシャルの設定が必要です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionStatus ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">接続済み</p>
                  <p className="text-sm text-muted-foreground">
                    {connectionStatus.google_email}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2 border-green-200 text-green-700 bg-green-50">
                  Active
                </Badge>
              </div>
              <Button variant="outline" onClick={handleDisconnect} className="text-red-600">
                <Unlink className="mr-2 h-4 w-4" />
                接続解除
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">未接続</p>
                  <p className="text-sm text-muted-foreground">
                    Googleアカウントを接続してGBPデータを取得
                  </p>
                </div>
              </div>
              <Button asChild>
                <a href="/api/google/connect">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Googleアカウントを接続
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account & Location Management (only shown when connected) */}
      {connectionStatus && (
        <>
          {/* GBP Accounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">GBPアカウント / ロケーション</CardTitle>
                  <CardDescription>
                    接続されたGoogleアカウントからGBPのアカウントとロケーションを取得します
                  </CardDescription>
                </div>
                <Button onClick={handleLoadAccounts} disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  アカウント取得
                </Button>
              </div>
            </CardHeader>
            {accounts.length > 0 && (
              <CardContent>
                <div className="flex items-end gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1.5 block">
                      GBPアカウント選択
                    </label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="アカウントを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acct) => (
                          <SelectItem key={acct.name} value={acct.name}>
                            {acct.accountName} ({acct.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleLoadLocations} disabled={loadingLocations || !selectedAccount}>
                    {loadingLocations ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Store className="mr-2 h-4 w-4" />
                    )}
                    ロケーション取得
                  </Button>
                </div>

                {/* Locations table */}
                {gbpLocations.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>店舗名</TableHead>
                        <TableHead className="hidden md:table-cell">住所</TableHead>
                        <TableHead className="hidden sm:table-cell">カテゴリ</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gbpLocations.map((loc) => (
                        <TableRow key={loc.name}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="font-medium">{loc.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {formatAddress(loc)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">
                              {loc.categories?.primaryCategory?.displayName || "未設定"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const accountId = selectedAccount;
                                const placeId = loc.metadata?.placeId || null;
                                // For MVP: link to the first available location in DB
                                // In production, show a dialog to select which app location to link
                                linkGbpLocation(
                                  "33333333-3333-3333-3333-333333333301", // placeholder
                                  accountId,
                                  loc.name,
                                  placeId
                                ).then(() => {
                                  setMessage({ type: "success", text: `${loc.title} をリンクしました` });
                                }).catch((err) => {
                                  setMessage({ type: "error", text: err.message });
                                });
                              }}
                            >
                              <LinkIcon className="mr-1 h-3 w-3" />
                              リンク
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            )}
          </Card>

          {/* Data Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">データ同期</CardTitle>
              <CardDescription>
                リンク済みのロケーションからデータを取得します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border shadow-none">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">口コミ同期</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      GBPの口コミを取得してデータベースに保存します
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleSyncReviews("33333333-3333-3333-3333-333333333301")}
                      disabled={syncing !== null}
                    >
                      {syncing?.startsWith("reviews") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      口コミを同期
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border shadow-none">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">パフォーマンス取得</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      過去30日間の表示回数・通話・経路検索等を取得します
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleSyncPerformance("33333333-3333-3333-3333-333333333301")}
                      disabled={syncing !== null}
                    >
                      {syncing?.startsWith("perf") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      パフォーマンス取得
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">セットアップ手順</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google Cloud Console
                  </a>{" "}
                  でプロジェクトを作成
                </li>
                <li>
                  APIライブラリで以下を有効化:
                  <ul className="ml-6 mt-1 list-disc space-y-1">
                    <li>My Business Business Information API</li>
                    <li>My Business Account Management API</li>
                    <li>Business Profile Performance API</li>
                  </ul>
                </li>
                <li>
                  OAuth同意画面を設定（外部 → テスト段階ではテストユーザーを追加）
                </li>
                <li>
                  認証情報 → OAuth 2.0 クライアントID を作成（Webアプリケーション）
                </li>
                <li>
                  リダイレクトURIに{" "}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                    {typeof window !== "undefined" ? window.location.origin : "https://your-domain"}/api/google/callback
                  </code>{" "}
                  を追加
                </li>
                <li>
                  クライアントIDとシークレットを環境変数
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs ml-1">GOOGLE_CLIENT_ID</code> /
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs ml-1">GOOGLE_CLIENT_SECRET</code>
                  に設定
                </li>
              </ol>
            </CardContent>
          </Card>
        </>
      )}

      {/* Show setup instructions when not connected */}
      {!connectionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">初回セットアップ手順</CardTitle>
            <CardDescription>
              GBP連携には Google Cloud の設定が必要です
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Cloud Console
                </a>{" "}
                でプロジェクトを作成
              </li>
              <li>
                APIライブラリで以下を有効化:
                <ul className="ml-6 mt-1 list-disc space-y-1">
                  <li>My Business Business Information API</li>
                  <li>My Business Account Management API</li>
                  <li>Business Profile Performance API</li>
                </ul>
              </li>
              <li>OAuth同意画面を設定（外部 → テストユーザーを追加）</li>
              <li>認証情報 → OAuth 2.0 クライアントID を作成（Webアプリケーション）</li>
              <li>
                リダイレクトURIに{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                  https://your-domain/api/google/callback
                </code>{" "}
                を追加
              </li>
              <li>
                環境変数に設定:
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs ml-1">GOOGLE_CLIENT_ID</code> /
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs ml-1">GOOGLE_CLIENT_SECRET</code>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
