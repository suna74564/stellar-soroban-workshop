#![no_std]
use soroban_sdk::{contract, contractclient, contractevent, contractimpl, contracttype, Address, Env};

#[contractclient(name = "BadgeClient")]
pub trait BadgeInterface {
    fn record(env: Env, user: Address, checkins: u32, total_checkins: u32) -> u32;
}

#[contract]
pub struct CheckinContract;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    User(Address),
    Total,
    Admin,
    BadgeContract,
}

#[contractevent(data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CheckIn {
    #[topic]
    pub user: Address,
    pub user_count: u32,
    pub total_count: u32,
    pub badge_score: u32,
}

#[contractevent(data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BadgeLinked {
    #[topic]
    pub admin: Address,
    pub badge_contract: Address,
}

#[contractimpl]
impl CheckinContract {
    /// Links a reputation badge contract that will be called after every check-in.
    pub fn configure_badge(env: Env, admin: Address, badge_contract: Address) -> Address {
        if let Some(current_admin) = env.storage().instance().get::<_, Address>(&DataKey::Admin) {
            current_admin.require_auth();
            assert!(current_admin == admin, "only the configured admin can update badge");
        } else {
            admin.require_auth();
            env.storage().instance().set(&DataKey::Admin, &admin);
        }

        env.storage()
            .instance()
            .set(&DataKey::BadgeContract, &badge_contract);
        env.storage().instance().extend_ttl(50, 100);

        BadgeLinked {
            admin,
            badge_contract: badge_contract.clone(),
        }
        .publish(&env);

        badge_contract
    }

    /// Records an authenticated wallet check-in and returns that wallet's count.
    pub fn check_in(env: Env, user: Address) -> u32 {
        user.require_auth();

        let user_key = DataKey::User(user.clone());
        let mut user_count: u32 = env.storage().instance().get(&user_key).unwrap_or(0);
        let mut total_count: u32 = env.storage().instance().get(&DataKey::Total).unwrap_or(0);

        user_count += 1;
        total_count += 1;

        env.storage().instance().set(&user_key, &user_count);
        env.storage().instance().set(&DataKey::Total, &total_count);
        env.storage().instance().extend_ttl(50, 100);

        let badge_score = match env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::BadgeContract)
        {
            Some(badge_contract) => {
                BadgeClient::new(&env, &badge_contract).record(&user, &user_count, &total_count)
            }
            None => 0,
        };

        CheckIn {
            user,
            user_count,
            total_count,
            badge_score,
        }
        .publish(&env);

        user_count
    }

    /// Returns how many times a wallet has checked in.
    pub fn get_count(env: Env, user: Address) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::User(user))
            .unwrap_or(0)
    }

    /// Returns all check-ins recorded by this contract.
    pub fn total(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Total).unwrap_or(0)
    }

    /// Returns the linked badge contract address, if one is configured.
    pub fn badge_contract(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::BadgeContract)
    }
}

mod test;
