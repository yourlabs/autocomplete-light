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
        return self.browser.find_by_css(f'#input-simple input')[0].type(val)


def get_input(browser, id):
    return retry(browser.evaluate_script)(
        f'document.getElementById("{id}").input',
    )


def test_example_is_working(browser):
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
    expected = choices[2].get_attribute('data-value')
    al.type(Keys.ENTER)
    assert al.input().get_attribute('value') == expected
