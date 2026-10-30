Feature: Cart calculations

  @advanced
  Scenario: Cart total is the sum of all line totals
    Given the shop is open in English
    When I add search result 1 for "Hammer" to the cart
    And I add search result 2 for "Hammer" to the cart
    And I add search result 3 for "Hammer" to the cart
    And I open the cart
    Then the cart has 3 lines
    And the cart total equals the sum of the line totals