import pytest

from selenium.webdriver.common.keys import Keys

from autocomplete_light import *  # noqa


def test_input_simple(browser):
    browser.visit('http://localhost:8000')
    al = AutocompleteLight(browser, 'input-simple')

    # wait until web component has initialized
    inpt = retry(al.input)
    assert inpt

    # box should not have been created yet: it's supposed to be lazy
    assert not al.box()

    # focus on input however, should create the box and display it
    inpt.click()

    # however we want to retry due to the async nature of the browser ofc
    box = retry(al.box)
    assert box
    assert not box.get_property('hidden')

    # all 4 test choices should be visible
    assert retry(lambda: len(al.choices()) == 4)

    # de-focus should hide the box
    al.defocus()
    assert retry(lambda: al.box().get_property('hidden'))

    # let's try filtering out a choice
    al.type('a')

    # should show the box again
    assert retry(lambda: not box.get_property('hidden'))

    # 3 test choices should be visible
    assert retry(lambda: len(al.choices()) == 3)

    choices = al.choices()

    # let's try some keyboard navigation ...
    for i in range(3):
        al.type(Keys.DOWN)
        assert al.hilight() == choices[i]

    # ... all the way back to the top!
    al.type(Keys.DOWN)
    assert al.hilight() == choices[0]

    # and the other way around too ...
    for i in range(3):
        al.type(Keys.UP)
        assert al.hilight() == choices[2 - i]

    # ... back to the bottom!
    al.type(Keys.UP)
    assert al.hilight() == choices[2]

    # try enter to select
    expected = choices[2].text
    al.type(Keys.ENTER)
    assert retry(lambda: al.input().get_attribute('value')) == expected


def test_select_simple(browser):
    browser.visit('http://localhost:8000')
    al = AutocompleteSelect(browser, 'select-simple')

    al.assert_selected('aab', 1)

    # let's click to remove the selected choice
    al.unselect(0)

    # this should show the autocomplete input again
    assert retry(lambda: not al.alight().get_property('hidden'))

    # this should have removed the choice from the deck
    assert retry(lambda: not al.selected())

    # and emptied the select value
    assert retry(lambda: not al.value())

    # let's type something in the input then
    al.type('a')

    # this should create a suggestion box
    box = retry(al.box)
    assert box

    # which should be displayed
    assert retry(lambda: not box.get_property('hidden'))

    # let's click a choice
    al.choices()[2].click()

    # should it all be like in the beginning but with this other value
    al.assert_selected('abb', 2)


@pytest.mark.parametrize('name', [
    'select-multiple',
    'select-multiple-local',
])
def test_select_multiple(browser, name):
    browser.visit('http://localhost:8000')
    al = AutocompleteSelectMultiple(browser, name)

    al.assert_selected(('aaa', 0), ('bbb', 3))

    # ensure selected choices are hidden
    al.focus()
    assert not any([
        choice.text in ('aaa', 'bbb')
        for choice in al.choices()
    ])

    # deselect the first option
    al.unselect(0)
    al.assert_selected(('bbb', 3))

    # type something to select the second option
    al.type('a')

    # this should create a suggestion box
    box = retry(al.box)
    assert box

    # which should be displayed
    assert retry(lambda: not box.get_property('hidden'))

    # let's click a choice
    al.choices()[2].click()

    # should it all be like in the beginning but with this other value
    al.assert_selected(('bbb', 3), ('abb', 2))

    # ensure selected choices are hidden
    al.focus()
    assert not any([
        choice.text in ('bbb', 'abb')
        for choice in al.choices()
    ])
