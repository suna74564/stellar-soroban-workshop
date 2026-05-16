#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contract]
pub struct CheckinContract;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    User(Address),
    Total,
}

#[contractimpl]
impl CheckinContract {
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
}

mod test;
