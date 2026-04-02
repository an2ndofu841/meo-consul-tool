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
import type { GbpAccount, GbpLocation } from "@/lib/google/gbp-client";

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
  const [appLocations, setAppLocations] = useState<Array<{
    id: string; name: string; address: string;
    gbp_account_id: string | null; gbp_location_name: string | null;
  }>>([]);
  const [orgId, setOrgId] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const [statusRes, locsRes] = await Promise.all([
        fetch("/api/google/status"),
        fetch("/api/google/locations"),
      ]);
      const statusData = await statusRes.json();
      const locsData = await locsRes.json();

      if (statusData.connected) {
        setConnectionStatus({
          google_email: statusData.google_email,
          created_at: statusData.created_at,
        });
      } else {
        setConnectionStatus(null);
      }

      setOrgId(statusData.org_id || locsData.org_id || null);
      setAppLocations(locsData.locations || []);
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
      const errorKey = error.split(":")[0];
      const errorDetail = error.includes(":") ? error.substring(error.indexOf(":") + 1) : "";
      const errorMessages: Record<string, string> = {
        google_not_configured: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が環境変数に設定されていません。Vercelの設定 → Environment Variables で追加してください",
        env_missing: `以下の環境変数がVercelに設定されていません: ${errorDetail}`,
        user_lookup_failed: `ユーザー情報の取得に失敗しました: ${errorDetail}`,
        permission_denied: `この操作にはadminまたはoperator権限が必要です (${errorDetail})`,
        connect_failed: `Google接続処理でエラーが発生しました: ${errorDetail}`,
        missing_code: "認証コードが取得できませんでした",
        no_refresh_token: "リフレッシュトークンが取得できませんでした。再度接続してください",
        db_error: "トークンの保存に失敗しました",
        callback_failed: "コールバック処理に失敗しました",
        access_denied: "アクセスが拒否されました",
      };
      setMessage({ type: "error", text: errorMessages[errorKey] || `エラー: ${error}` });
    }
  }, [searchParams, checkConnection]);

  const handleLoadAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/google/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "アカウント取得に失敗");
      setAccounts(data.accounts || []);
      if (data.accounts?.length > 0) {
        setSelectedAccount(data.accounts[0].name);
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
      const res = await fetch(
        `/api/google/accounts?action=locations&account=${encodeURIComponent(selectedAccount)}&import=true`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ロケーション取得に失敗");
      setGbpLocations(data.locations || []);
      if (data.imported?.length > 0) {
        setMessage({ type: "success", text: data.message });
        checkConnection();
      }
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
      const res = await fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_reviews", locationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "同期に失敗しました");
      setMessage({ type: "success", text: `口コミ ${data.syncedCount} 件を同期しました` });
    } catch (err) {
      setMessage({ type: "error", text: `同期エラー: ${err instanceof Error ? err.message : "不明"}` });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAllReviews = async () => {
    const linkedLocs = appLocations.filter(l => l.gbp_location_name);
    if (linkedLocs.length === 0) return;
    try {
      setSyncing("all");
      let totalSynced = 0;
      for (const loc of linkedLocs) {
        const res = await fetch("/api/google/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync_reviews", locationId: loc.id }),
        });
        const data = await res.json();
        if (res.ok) totalSynced += data.syncedCount || 0;
      }
      setMessage({ type: "success", text: `全 ${linkedLocs.length} ロケーションから口コミ ${totalSynced} 件を同期しました` });
    } catch (err) {
      setMessage({ type: "error", text: `一括同期エラー: ${err instanceof Error ? err.message : "不明"}` });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncPerformance = async (locationId: string) => {
    try {
      setSyncing(`perf-${locationId}`);
      const res = await fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_performance", locationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取得に失敗しました");
      const m = data.metrics;
      setMessage({
        type: "success",
        text: `パフォーマンス取得完了 — 検索: ${m.searchViews}, マップ: ${m.mapViews}, 通話: ${m.phoneCallClicks}`,
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
                            <div className="flex items-center gap-2 justify-end">
                              {appLocations.length > 0 ? (
                                <>
                                  <Select
                                    onValueChange={(appLocId) => {
                                      const accountId = selectedAccount;
                                      const placeId = loc.metadata?.placeId || null;
                                      fetch("/api/google/link", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          locationId: appLocId,
                                          gbpAccountId: accountId,
                                          gbpLocationName: loc.name,
                                          gbpPlaceId: placeId,
                                        }),
                                      }).then(async (res) => {
                                        const data = await res.json();
                                        if (!res.ok) throw new Error(data.error);
                                        setMessage({ type: "success", text: `${loc.title} をリンクしました` });
                                        checkConnection();
                                      }).catch((err: unknown) => {
                                        setMessage({ type: "error", text: err instanceof Error ? err.message : "リンクに失敗" });
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="w-[160px] h-8 text-xs">
                                      <SelectValue placeholder="リンク先を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {appLocations.map((appLoc) => (
                                        <SelectItem key={appLoc.id} value={appLoc.id}>
                                          {appLoc.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">ロケーション未登録</span>
                              )}
                            </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">データ同期</CardTitle>
                  <CardDescription>
                    GBPリンク済みのロケーションからデータを取得します
                  </CardDescription>
                </div>
                {appLocations.filter(l => l.gbp_location_name).length > 0 && (
                  <Button onClick={handleSyncAllReviews} disabled={syncing !== null}>
                    {syncing === "all" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    全ロケーション口コミ一括同期
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const linkedLocations = appLocations.filter(l => l.gbp_location_name);
                const unlinkedLocations = appLocations.filter(l => !l.gbp_location_name);

                if (appLocations.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      ロケーションが登録されていません。先に管理画面でロケーションを追加してください。
                    </p>
                  );
                }

                if (linkedLocations.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      GBPにリンクされたロケーションがありません。上の「GBPアカウント / ロケーション」セクションでリンクしてください。
                      <br />
                      <span className="text-xs mt-1 block">登録済みロケーション: {unlinkedLocations.map(l => l.name).join(", ")}</span>
                    </p>
                  );
                }

                return (
                  <div className="space-y-4">
                    {linkedLocations.map((loc) => (
                      <Card key={loc.id} className="border shadow-none">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {loc.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{loc.address}</p>
                            </div>
                            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                              GBPリンク済み
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSyncReviews(loc.id)}
                              disabled={syncing !== null}
                            >
                              {syncing === `reviews-${loc.id}` ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                              )}
                              口コミ同期
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSyncPerformance(loc.id)}
                              disabled={syncing !== null}
                            >
                              {syncing === `perf-${loc.id}` ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                              )}
                              パフォーマンス取得
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })()}
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
