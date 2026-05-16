#![cfg(test)]

use crate::{CheckinContract, CheckinContractClient};
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env};

#[test]
fn test_check_in() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CheckinContract, ());
    let client = CheckinContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    let other_user = Address::generate(&env);

    assert_eq!(client.get_count(&user), 0);
    assert_eq!(client.total(), 0);

    assert_eq!(client.check_in(&user), 1);
    assert_eq!(client.check_in(&user), 2);
    assert_eq!(client.check_in(&other_user), 1);

    assert_eq!(client.get_count(&user), 2);
    assert_eq!(client.get_count(&other_user), 1);
    assert_eq!(client.total(), 3);
}
