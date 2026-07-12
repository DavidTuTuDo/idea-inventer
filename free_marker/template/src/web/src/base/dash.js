const edit = true;

import "./dashboard.css";
import React from "react";
import { observer } from "mobx-react";
import { utiller as Util } from "utiller";
import ImpComponent from "../ImpComponent";
import UserInfoRef from "../BaseUserInfo";

class DashboardComponent extends ImpComponent {
    /** -------------------- fields -------------------- **/

    static nameOfComponent = "dashboard";

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
        this.setPageFullTitle("數據儀表板");
        this.exeAsyncT(this.initializeDashboard());
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    getStore = () => {
        const store = this.propsMobX().dashboard;
        store.setComponent(this);
        return store;
    };

    initializeDashboard = async () => {
        await UserInfoRef.waitLoginCompleted();
        await this.getStore().fetch(this);
    };

    /** 刷新按鈕 */
    onRefreshClicked = () => {
        this.exeAsyncT(this.getStore().fetch(this));
    };

    /** ---------- 格式化工具 ---------- */
    formatCurrency = (val) => `NT$ ${Number(val).toLocaleString()}`;
    formatNumber = (val) => Number(val).toLocaleString();

    getStatusLabel = (status) => {
        const map = { paid: "已付款", shipping: "配送中", pending: "待處理", completed: "已完成" };
        return map[status] || status;
    };

    /** ==========================================
     *  📊 Card 1: 每週收入
     *  呼叫機制 → store.fetchWeeklyRevenue()
     *  ========================================== */
    WeeklyRevenueCard = observer(() => {
        const store = this.getStore();
        const { currentWeek, previousWeek, changePercent, dailyTrend } = store.weeklyRevenue;
        const isUp = changePercent >= 0;
        const maxAmount = Math.max(...dailyTrend.map((d) => d.amount), 1);

        return (
            <div className="dash-card" id="dashboard-card-weekly-revenue">
                <div className="dash-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="dash-card-icon revenue">📊</div>
                        <span className="dash-card-title">每週收入</span>
                    </div>
                    <span className={`dash-card-badge ${isUp ? "up" : "down"}`}>
                        {isUp ? "▲" : "▼"} {Math.abs(changePercent)}%
                    </span>
                </div>
                <div className="dash-revenue-value">{this.formatCurrency(currentWeek)}</div>
                <div className="dash-revenue-compare">上週 {this.formatCurrency(previousWeek)}</div>
                <div className="dash-mini-chart">
                    {dailyTrend.map((d, i) => (
                        <div key={i} className="dash-mini-bar" style={{ height: `${(d.amount / maxAmount) * 100}%` }} title={`${d.day}: ${this.formatCurrency(d.amount)}`}>
                            <span className="dash-mini-bar-label">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    });

    /** ==========================================
     *  🔥 Card 2: 商品點擊率排行
     *  呼叫機制 → store.fetchTopClickedProducts()
     *  ========================================== */
    TopClickedProductsCard = observer(() => {
        const store = this.getStore();
        const products = store.topClickedProducts;
        const maxCount = products.length > 0 ? products[0].clickCount : 1;

        return (
            <div className="dash-card" id="dashboard-card-top-products">
                <div className="dash-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="dash-card-icon products">🔥</div>
                        <span className="dash-card-title">商品點擊率排行</span>
                    </div>
                    <span className="dash-card-badge up">TOP 5</span>
                </div>
                <div className="dash-product-list">
                    {products.map((p, i) => (
                        <div className="dash-product-item" key={p.id}>
                            <div className={`dash-product-rank rank-${i + 1}`}>{i + 1}</div>
                            <div className="dash-product-info">
                                <div className="dash-product-name">{p.name}</div>
                                <div className="dash-product-bar-track">
                                    <div className="dash-product-bar-fill" style={{ width: `${(p.clickCount / maxCount) * 100}%` }} />
                                </div>
                            </div>
                            <div className="dash-product-count">{this.formatNumber(p.clickCount)}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    });

    /** ==========================================
     *  🔄 Card 3: 訂單轉換率
     *  呼叫機制 → store.fetchConversionRate()
     *  ========================================== */
    ConversionRateCard = observer(() => {
        const store = this.getStore();
        const { totalViews, totalOrders, rate } = store.conversionRate;
        const circumference = 2 * Math.PI * 42;
        const offset = circumference - (rate / 100) * circumference;

        return (
            <div className="dash-card" id="dashboard-card-conversion-rate">
                <div className="dash-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="dash-card-icon conversion">🔄</div>
                        <span className="dash-card-title">訂單轉換率</span>
                    </div>
                </div>
                <div className="dash-conversion-ring-container">
                    <div className="dash-conversion-ring">
                        <svg width="110" height="110" viewBox="0 0 110 110">
                            <defs>
                                <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                            <circle className="dash-conversion-ring-bg" cx="55" cy="55" r="42" />
                            <circle className="dash-conversion-ring-fill" cx="55" cy="55" r="42" strokeDasharray={circumference} strokeDashoffset={offset} />
                        </svg>
                        <div className="dash-conversion-value">{rate}%</div>
                    </div>
                    <div className="dash-conversion-stats">
                        <div className="dash-conversion-stat-item">
                            <span className="dash-conversion-stat-label">總瀏覽數</span>
                            <span className="dash-conversion-stat-value">{this.formatNumber(totalViews)}</span>
                        </div>
                        <div className="dash-conversion-stat-item">
                            <span className="dash-conversion-stat-label">成交訂單</span>
                            <span className="dash-conversion-stat-value">{this.formatNumber(totalOrders)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    /** ==========================================
     *  📋 Card 4: 近期訂單動態
     *  呼叫機制 → store.fetchRecentOrders()
     *  ========================================== */
    RecentOrdersCard = observer(() => {
        const store = this.getStore();
        const orders = store.recentOrders;

        return (
            <div className="dash-card" id="dashboard-card-recent-orders">
                <div className="dash-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="dash-card-icon orders">📋</div>
                        <span className="dash-card-title">近期訂單動態</span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--dash-text-muted)" }}>
                        <span className="dash-live-dot" />
                        即時
                    </span>
                </div>
                <div className="dash-orders-list">
                    {orders.map((order) => (
                        <div className="dash-order-item" key={order.id}>
                            <div className="dash-order-left">
                                <div className="dash-order-avatar">{order.buyer.charAt(0)}</div>
                                <div>
                                    <div className="dash-order-buyer">{order.buyer}</div>
                                    <div className="dash-order-time">{order.time}</div>
                                </div>
                            </div>
                            <div className="dash-order-right">
                                <div className="dash-order-amount">{this.formatCurrency(order.amount)}</div>
                                <span className={`dash-order-status ${order.status}`}>{this.getStatusLabel(order.status)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    });

    /** ==========================================
     *  💳 Card 5: 支付方式分布
     *  呼叫機制 → store.fetchPaymentDistribution()
     *  ========================================== */
    PaymentDistributionCard = observer(() => {
        const store = this.getStore();
        const distribution = store.paymentDistribution;

        return (
            <div className="dash-card" id="dashboard-card-payment-distribution">
                <div className="dash-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="dash-card-icon payment">💳</div>
                        <span className="dash-card-title">支付方式分布</span>
                    </div>
                </div>
                <div className="dash-payment-chart">
                    {distribution.map((item, i) => (
                        <div className="dash-payment-item" key={i}>
                            <div className="dash-payment-dot" style={{ background: item.color }} />
                            <div className="dash-payment-info">
                                <div className="dash-payment-label">{item.method}</div>
                                <div className="dash-payment-bar-track">
                                    <div
                                        className="dash-payment-bar-fill"
                                        style={{
                                            width: `${item.percent}%`,
                                            background: item.color
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="dash-payment-percent">{item.percent}%</div>
                            <div className="dash-payment-count">{item.count}筆</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    });

    /** ==========================================
     *  🔁 Card 6: 客戶回購率
     *  呼叫機制 → store.fetchCustomerRetention()
     *  ========================================== */
    CustomerRetentionCard = observer(() => {
        const store = this.getStore();
        const { newCustomers, returningCustomers, retentionRate } = store.customerRetention;
        const total = newCustomers + returningCustomers;
        const circumference = 2 * Math.PI * 38;
        const returnOffset = circumference - (total > 0 ? returningCustomers / total : 0) * circumference;

        return (
            <div className="dash-card" id="dashboard-card-customer-retention">
                <div className="dash-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="dash-card-icon retention">🔁</div>
                        <span className="dash-card-title">客戶回購率</span>
                    </div>
                    <span className={`dash-card-badge ${retentionRate >= 30 ? "up" : "down"}`}>{retentionRate}%</span>
                </div>
                <div className="dash-retention-container">
                    <div className="dash-retention-donut">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle className="dash-retention-donut-bg" cx="50" cy="50" r="38" />
                            <circle className="dash-retention-donut-return" cx="50" cy="50" r="38" strokeDasharray={circumference} strokeDashoffset={returnOffset} />
                        </svg>
                        <div className="dash-retention-center-value">{retentionRate}%</div>
                    </div>
                    <div className="dash-retention-legend">
                        <div className="dash-retention-legend-item">
                            <div className="dash-retention-legend-dot new-customer" />
                            <div>
                                <div className="dash-retention-legend-label">新客戶</div>
                                <div className="dash-retention-legend-value">{this.formatNumber(newCustomers)}</div>
                            </div>
                        </div>
                        <div className="dash-retention-legend-item">
                            <div className="dash-retention-legend-dot return-customer" />
                            <div>
                                <div className="dash-retention-legend-label">回購客戶</div>
                                <div className="dash-retention-legend-value">{this.formatNumber(returningCustomers)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    /** ---------- Render ---------- */
    render() {
        const self = this;
        const store = this.getStore();
        const WeeklyRevenueCard = this.WeeklyRevenueCard;
        const TopClickedProductsCard = this.TopClickedProductsCard;
        const ConversionRateCard = this.ConversionRateCard;
        const RecentOrdersCard = this.RecentOrdersCard;
        const PaymentDistributionCard = this.PaymentDistributionCard;
        const CustomerRetentionCard = this.CustomerRetentionCard;

        return (
            <div className="dashboard-container" id="dashboard-page">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="dashboard-header-left">
                        <h1 className="dashboard-title">數據儀表板</h1>
                        <p className="dashboard-subtitle">即時商業分析概覽</p>
                    </div>
                    <div className="dashboard-header-right">
                        <button className={`dashboard-refresh-btn ${store.isLoading ? "is-loading" : ""}`} onClick={self.onRefreshClicked} id="dashboard-refresh-button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            {store.isLoading ? "更新中..." : "刷新數據"}
                        </button>
                    </div>
                </div>

                {/* 6-Card Grid */}
                <div className="dashboard-grid">
                    <WeeklyRevenueCard />
                    <TopClickedProductsCard />
                    <ConversionRateCard />
                    <RecentOrdersCard />
                    <PaymentDistributionCard />
                    <CustomerRetentionCard />
                </div>
            </div>
        );
    }
}

export default DashboardComponent;
