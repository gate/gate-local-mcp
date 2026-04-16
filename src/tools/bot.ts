import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BotApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

const strategyTypeEnum = z.enum([
  'spot_grid', 'margin_grid', 'infinite_grid', 'futures_grid',
  'spot_martingale', 'contract_martingale',
]);

export function registerBotTools(server: McpServer): void {
  server.tool(
    'cex_bot_get_ai_hub_strategy_recommend',
    'Get AI strategy recommendations for quantitative trading.',
    {
      market: z.string().optional().describe('Market / currency pair e.g. BTC_USDT'),
      strategy_type: z.enum(['spot_grid', 'margin_grid', 'infinite_grid', 'futures_grid', 'spot_martingale']).optional().describe('Strategy type filter'),
      direction: z.enum(['buy', 'sell', 'neutral']).optional().describe('Direction filter'),
      invest_amount: z.string().optional().describe('Investment amount'),
      scene: z.enum(['top1', 'bundle', 'filter', 'refresh']).optional().describe('Recommendation scene'),
      refresh_recommendation_id: z.string().optional().describe('ID for refresh scene'),
      limit: z.number().int().optional().describe('Max results'),
      max_drawdown_lte: z.string().optional().describe('Max drawdown upper bound'),
      backtest_apr_gte: z.string().optional().describe('Backtest APR lower bound'),
    },
    async ({ market, strategy_type, direction, invest_amount, scene, refresh_recommendation_id, limit, max_drawdown_lte, backtest_apr_gte }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (market !== undefined) opts.market = market;
        if (strategy_type !== undefined) opts.strategyType = strategy_type;
        if (direction !== undefined) opts.direction = direction;
        if (invest_amount !== undefined) opts.investAmount = invest_amount;
        if (scene !== undefined) opts.scene = scene;
        if (refresh_recommendation_id !== undefined) opts.refreshRecommendationId = refresh_recommendation_id;
        if (limit !== undefined) opts.limit = limit;
        if (max_drawdown_lte !== undefined) opts.maxDrawdownLte = max_drawdown_lte;
        if (backtest_apr_gte !== undefined) opts.backtestAprGte = backtest_apr_gte;
        const { body } = await new BotApi(createClient()).getAIHubStrategyRecommend(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_post_ai_hub_spot_grid_create',
    'Create a spot grid trading strategy. State-changing',
    {
      market: z.string().describe('Currency pair e.g. BTC_USDT'),
      create_params: z.string().max(10240).describe('JSON string of SpotGridCreateParams'),
    },
    async ({ market, create_params }) => {
      try {
        requireAuth();
        const { SpotGridCreateRequest } = await import('gate-api');
        const req = new SpotGridCreateRequest();
        req.strategyType = SpotGridCreateRequest.StrategyType.SpotGrid;
        req.market = market;
        req.createParams = JSON.parse(create_params);
        const { body } = await new BotApi(createClient()).postAIHubSpotGridCreate(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_post_ai_hub_margin_grid_create',
    'Create a margin grid trading strategy. State-changing',
    {
      market: z.string().describe('Currency pair e.g. BTC_USDT'),
      create_params: z.string().max(10240).describe('JSON string of MarginGridCreateParams'),
    },
    async ({ market, create_params }) => {
      try {
        requireAuth();
        const { MarginGridCreateRequest } = await import('gate-api');
        const req = new MarginGridCreateRequest();
        req.strategyType = MarginGridCreateRequest.StrategyType.MarginGrid;
        req.market = market;
        req.createParams = JSON.parse(create_params);
        const { body } = await new BotApi(createClient()).postAIHubMarginGridCreate(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_post_ai_hub_infinite_grid_create',
    'Create an infinite grid trading strategy. State-changing',
    {
      market: z.string().describe('Currency pair e.g. BTC_USDT'),
      create_params: z.string().max(10240).describe('JSON string of InfiniteGridCreateParams'),
    },
    async ({ market, create_params }) => {
      try {
        requireAuth();
        const { InfiniteGridCreateRequest } = await import('gate-api');
        const req = new InfiniteGridCreateRequest();
        req.strategyType = InfiniteGridCreateRequest.StrategyType.InfiniteGrid;
        req.market = market;
        req.createParams = JSON.parse(create_params);
        const { body } = await new BotApi(createClient()).postAIHubInfiniteGridCreate(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_post_ai_hub_futures_grid_create',
    'Create a futures grid trading strategy. State-changing',
    {
      market: z.string().describe('Currency pair e.g. BTC_USDT'),
      create_params: z.string().max(10240).describe('JSON string of FuturesGridCreateParams'),
    },
    async ({ market, create_params }) => {
      try {
        requireAuth();
        const { FuturesGridCreateRequest } = await import('gate-api');
        const req = new FuturesGridCreateRequest();
        req.strategyType = FuturesGridCreateRequest.StrategyType.FuturesGrid;
        req.market = market;
        req.createParams = JSON.parse(create_params);
        const { body } = await new BotApi(createClient()).postAIHubFuturesGridCreate(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_post_ai_hub_spot_martingale_create',
    'Create a spot martingale trading strategy. State-changing',
    {
      market: z.string().describe('Currency pair e.g. BTC_USDT'),
      create_params: z.string().max(10240).describe('JSON string of SpotMartingaleCreateParams'),
    },
    async ({ market, create_params }) => {
      try {
        requireAuth();
        const { SpotMartingaleCreateRequest } = await import('gate-api');
        const req = new SpotMartingaleCreateRequest();
        req.strategyType = SpotMartingaleCreateRequest.StrategyType.SpotMartingale;
        req.market = market;
        req.createParams = JSON.parse(create_params);
        const { body } = await new BotApi(createClient()).postAIHubSpotMartingaleCreate(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_post_ai_hub_contract_martingale_create',
    'Create a contract martingale trading strategy. State-changing',
    {
      market: z.string().describe('Currency pair e.g. BTC_USDT'),
      create_params: z.string().max(10240).describe('JSON string of ContractMartingaleCreateParams'),
    },
    async ({ market, create_params }) => {
      try {
        requireAuth();
        const { ContractMartingaleCreateRequest } = await import('gate-api');
        const req = new ContractMartingaleCreateRequest();
        req.strategyType = ContractMartingaleCreateRequest.StrategyType.ContractMartingale;
        req.market = market;
        req.createParams = JSON.parse(create_params);
        const { body } = await new BotApi(createClient()).postAIHubContractMartingaleCreate(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_get_ai_hub_portfolio_running',
    'List running AI trading strategies.',
    {
      strategy_type: strategyTypeEnum.optional().describe('Strategy type filter'),
      market: z.string().optional().describe('Market / currency pair filter'),
      page: z.number().int().optional().describe('Page number'),
      page_size: z.number().int().optional().describe('Results per page'),
    },
    async ({ strategy_type, market, page, page_size }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (strategy_type !== undefined) opts.strategyType = strategy_type;
        if (market !== undefined) opts.market = market;
        if (page !== undefined) opts.page = page;
        if (page_size !== undefined) opts.pageSize = page_size;
        const { body } = await new BotApi(createClient()).getAIHubPortfolioRunning(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_get_ai_hub_portfolio_detail',
    'Get details of a specific AI trading strategy.',
    {
      strategy_id: z.string().describe('Strategy ID'),
      strategy_type: strategyTypeEnum.describe('Strategy type'),
    },
    async ({ strategy_id, strategy_type }) => {
      try {
        requireAuth();
        const { body } = await new BotApi(createClient()).getAIHubPortfolioDetail(strategy_id, strategy_type);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_bot_post_ai_hub_portfolio_stop',
    'Stop a running AI trading strategy. State-changing',
    {
      strategy_id: z.string().describe('Strategy ID to stop'),
      strategy_type: strategyTypeEnum.describe('Strategy type'),
    },
    async ({ strategy_id, strategy_type }) => {
      try {
        requireAuth();
        const { AIHubPortfolioStopRequest } = await import('gate-api');
        const req = new AIHubPortfolioStopRequest();
        req.strategyId = strategy_id;
        req.strategyType = strategy_type as never;
        const { body } = await new BotApi(createClient()).postAIHubPortfolioStop(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
