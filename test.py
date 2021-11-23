from selenium.webdriver.common.keys import Keys


def retry(cb, *args, expected=None, **kwargs):
    i = 15
    while True:
        try:
            result = cb(*args, **kwargs)
        except:
            if not i:
                raise
        else:
            if expected is not None and result == expected:
                return result
            elif expected is None and result:
                return result

        i -= 1
    return wrapper


class AutocompleteLight:
    def __init__(self, browser, autocomplete_light_id):
        self.id = autocomplete_light_id
        self.browser = browser

    def component(self):
        return self.browser.find_by_id(self.id)

    def attr(self, name):
        return self.browser.evaluate_script(
            f'document.getElementById("{self.id}").' + name
        )

    def input(self):
        return self.attr('input')

    def box(self):
        return self.attr('box')

    def hilight(self):
        return self.browser.evaluate_script(
            f'document.getElementById("{self.id}").box.querySelector("[data-value].hilight")'
        )

    def choices(self):
        return self.browser.evaluate_script(
            f'document.getElementById("{self.id}").box.querySelectorAll("[data-value]")'
        )

    def focus(self):
        return self.input().click()

    def defocus(self):
        return self.browser.find_by_css('body').click()

    def type(self, val):
        return self.browser.find_by_css(f'#{self.id} input')[0].type(val)


class AutocompleteSelect(AutocompleteLight):
    def alight(self):
        return self.attr('input')

    def input(self):
        return self.attr('input.input')

    def box(self):
        return self.attr('input.box')

    def selected(self):
        return self.browser.evaluate_script(
            f'document.getElementById("{self.id}").deck.querySelectorAll("[data-value]")'
        )

    def selectedOptions(self):
        return self.attr('select.selectedOptions')

    def select(self):
        return self.attr('select')

    def value(self):
        return self.select().get_property('value')

    def choices(self):
        return self.browser.evaluate_script(
            f'document.getElementById("{self.id}").input.box.querySelectorAll("[data-value]")'
        )

    def unselect(self, index):
        self.selected()[index].find_element_by_tag_name('span').click()


def get_input(browser, id):
    return retry(browser.evaluate_script)(
        f'document.getElementById("{id}").input',
    )


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

    def assert_selected(label, value):
        # get selected choices from deck
        selected = retry(al.selected)

        # there should only be one selected choice
        assert len(selected) == 1

        # value of the select should be that of the selected choice
        assert selected[0].get_attribute('data-value') == str(value)
        assert al.value() == str(value)

        # text of the selected choice in the deck should be right
        assert selected[0].text.split('\n')[0] == label

        # maxChoices reached: autocomplete should be hidden
        assert al.input().get_property('hidden')

    assert_selected('aab', 1)

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
    assert_selected('abb', 2)


def test_select_multiple(browser):
    browser.visit('http://localhost:8000')
    al = AutocompleteSelect(browser, 'select-multiple')

    def assert_selected(*label_values):
        # get selected choices from deck
        selected = retry(al.selected)

        # number of selected choices should match
        assert len(selected) == len(label_values)

        # number of selectedOptions should match
        assert len(al.selectedOptions()) == len(label_values)

        # value of the select should be that of the selected choice
        for label_value, choice in zip(label_values, selected):
            label, value = label_value
            assert choice.get_attribute('data-value') == str(value)
            assert choice.text.split('\n')[0] == label

        # maxChoices of 0: autocomplete should not hide
        assert not al.alight().get_property('hidden')

    assert_selected(('aaa', 0), ('bbb', 3))

    # deselect the first option
    al.unselect(0)
    assert_selected(('bbb', 3))

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
    assert_selected(('bbb', 3), ('abb', 2))
