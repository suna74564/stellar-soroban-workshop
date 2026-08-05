#![no_std]
use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env};

#[contract]
pub struct BadgeContract;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Score(Address),
    TotalBadges,
}

#[contractevent(data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BadgeUpdated {
    #[topic]
    pub user: Address,
    pub score: u32,
    pub total_badges: u32,
}

fn score_for(checkins: u32, total_checkins: u32) -> u32 {
    let consistency = checkins.saturating_mul(10);
    let community = total_checkins / 5;
    consistency.saturating_add(community).min(100)
}

#[contractimpl]
impl BadgeContract {
    /// Records reputation for a wallet based on check-in activity.
    pub fn record(env: Env, user: Address, checkins: u32, total_checkins: u32) -> u32 {
        let score = score_for(checkins, total_checkins);
        let previous_score: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Score(user.clone()))
            .unwrap_or(0);
        let mut total_badges: u32 = env.storage().instance().get(&DataKey::TotalBadges).unwrap_or(0);

        if previous_score == 0 && score > 0 {
            total_badges += 1;
            env.storage()
                .instance()
                .set(&DataKey::TotalBadges, &total_badges);
        }

        env.storage()
            .instance()
            .set(&DataKey::Score(user.clone()), &score);
        env.storage().instance().extend_ttl(50, 100);

        BadgeUpdated {
            user,
            score,
            total_badges,
        }
        .publish(&env);

        score
    }

    /// Returns a wallet's current reputation score.
    pub fn score(env: Env, user: Address) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Score(user))
            .unwrap_or(0)
    }

    /// Returns the number of wallets with a recorded badge.
    pub fn total_badges(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalBadges).unwrap_or(0)
    }
}

mod test;
