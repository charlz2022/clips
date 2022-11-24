import { Component, AfterContentInit, ContentChildren, QueryList } from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.css']
})
export class TabsContainerComponent implements AfterContentInit {
  // @ContentChildren(TabComponent) tabs: QueryList<TabComponent> = new QueryList();
  @ContentChildren(TabComponent) tabs?: QueryList<TabComponent>

  constructor() { }

  ngAfterContentInit(): void {
    const activeTabs = this.tabs?.filter(
      tab => tab.active
    )

    if(!activeTabs || activeTabs.length === 0) {
      this.selectTab(this.tabs!.first);
    }
  }

  selectTab(tab: TabComponent): boolean {
    this.tabs?.forEach(tab => {
      tab.active = false
    })

    tab.active = true

    return false // This prevent the anchor <a> from redirecting to another page.
  }

}
